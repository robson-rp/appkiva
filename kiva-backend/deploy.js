import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import axios from 'axios';
import FormData from 'form-data';
import https from 'https';

dotenv.config();

// ============================================================
// 🔧 CONFIGURAÇÕES DO cPanel — ALTERE APENAS ESTAS VARIÁVEIS
// ============================================================
const CPANEL_HOST = 'talkgenie.net';        // Ex: niva.ao, meuserver.com
const CPANEL_PORT = '2083';                     // Porta do cPanel (normalmente 2083)
const CPANEL_USER = 'talkgenie';          // Username do cPanel
const APP_DIR = 'kiva.talkgenie.net';         // Subdomínio/pasta no public_html
// ============================================================
    // As variáveis abaixo vêm do .env local:
    //   CPANEL_API_TOKEN  — Token de API do cPanel
//   DEPLOYMENT_TOKEN  — Token secreto para o hook de deploy
// ============================================================

const API_TOKEN = process.env.CPANEL_API_TOKEN;
const APP_ROOT_PATH = `/home/${CPANEL_USER}/public_html/${APP_DIR}`;
const BASE_URL = `https://${CPANEL_HOST}:${CPANEL_PORT}/execute`;

// Ignorar verificação SSL (comum em cPanels com cert auto-assinado)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        Authorization: `cpanel ${CPANEL_USER}:${API_TOKEN}`
    },
    httpsAgent
});

api.interceptors.response.use((response) => {
    const data = response.data;
    if (data && data.status === 0) {
        const errs = data.errors ? data.errors.join(', ') : 'Erro desconhecido na UAPI';
        throw new Error(`cPanel UAPI Error: ${errs}`);
    }
    if (data && data.cpanelresult && data.cpanelresult.error) {
        throw new Error(`cPanel API2 Error: ${data.cpanelresult.error}`);
    }
    return response;
}, (error) => {
    return Promise.reject(error);
});

const SITE_ZIP = path.join(process.cwd(), 'laravel.zip');

// Utils
const log = (msg) => console.log(`[DEPLOY] ${msg}`);
const logSuccess = (msg) => console.log(`✅ ${msg}`);
const logError = (msg) => console.error(`❌ ${msg}`);

async function zipLaravel(outPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => resolve());
        archive.on('error', (err) => reject(err));

        archive.pipe(output);

        archive.glob('**/*', {
            cwd: process.cwd(),
            ignore: [
                '.git/**',
                'node_modules/**',
                '.env',
                'storage/logs/*.log',
                'storage/framework/sessions/**',
                'storage/framework/cache/**',
                'database/database.sqlite',
                'tests/**',
                'phpunit.xml',
                'test-api.sh',
                '.DS_Store',
                '*.zip',
                'deploy.js',
                // Dev dependencies (excluir do zip de produção)
                'vendor/fakerphp/**',
                'vendor/laravel/pail/**',
                'vendor/laravel/pint/**',
                'vendor/laravel/sail/**',
                'vendor/mockery/**',
                'vendor/nunomaduro/collision/**',
                'vendor/phpunit/**',
                'vendor/hamcrest/**',
                'vendor/sebastian/**',
                'vendor/phar-io/**',
                'vendor/theseer/**',
                'vendor/filp/**',
                'vendor/staabm/**',
            ],
            dot: true
        });

        archive.finalize();
    });
}

// --- APIs do cPanel ---

async function classicFileop(op, sourcefiles, destfiles = null) {
    const legacyApi = axios.create({
        baseURL: `https://${CPANEL_HOST}:${CPANEL_PORT}/json-api/cpanel`,
        headers: { Authorization: `cpanel ${CPANEL_USER}:${API_TOKEN}` },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });

    const params = {
        cpanel_jsonapi_apiversion: '2',
        cpanel_jsonapi_module: 'Fileman',
        cpanel_jsonapi_func: 'fileop',
        op: op,
        sourcefiles: sourcefiles
    };
    if (destfiles) params.destfiles = destfiles;

    const res = await legacyApi.get('', { params });
    if (res.data && res.data.cpanelresult && res.data.cpanelresult.error) {
        throw new Error(`cPanel API2 Error (${op}): ${res.data.cpanelresult.error}`);
    }
}

async function cleanServer() {
    const res = await api.get(`/Fileman/list_files?dir=${encodeURIComponent(APP_ROOT_PATH)}`);
    if (!res.data || !res.data.data) return;

    const filesToDelete = res.data.data
        .filter(f => f.file !== '.htaccess' && f.file !== 'storage' && f.file !== '.' && f.file !== '..')
        .map(f => `${APP_ROOT_PATH}/${f.file}`);

    if (filesToDelete.length > 0) {
        await api.post('/Fileman/empty_trash').catch(() => {});

        const filesStr = filesToDelete.join(',');
        try {
            await classicFileop('trash', filesStr);
        } catch {
            try {
                await classicFileop('unlink', filesStr);
            } catch {}
        }
    }
}

async function uploadFile(filePath, destDir) {
    const form = new FormData();
    form.append('dir', destDir);
    form.append('file-1', fs.createReadStream(filePath));

    const formHeaders = form.getHeaders();
    const contentLength = await new Promise((resolve, reject) => {
        form.getLength((err, length) => {
            if (err) reject(err);
            else resolve(length);
        });
    });
    formHeaders['Content-Length'] = contentLength;

    await api.post('/Fileman/upload_files', form, {
        headers: formHeaders,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 0
    });
}

async function extractZip(filePath, destDir) {
    const form = new URLSearchParams();
    form.append('sourcefiles', filePath);
    form.append('destfiles', destDir);

    try {
        await api.post('/Fileman/extract', form, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            baseURL: `https://${CPANEL_HOST}:${CPANEL_PORT}/execute`,
            timeout: 0
        });
    } catch (e) {
        const msg = (e.message || '');
        if (e.code === 'ECONNRESET' || msg.includes('ECONNRESET') || msg.includes('timeout')) {
            console.log('\n[Aviso] Conexão caiu durante a extração (normal para zips grandes). Aguardando...');
            await new Promise(res => setTimeout(res, 15000));
            return;
        }

        try {
            await classicFileop('extract', filePath, destDir);
        } catch (e2) {
            const msg2 = (e2.message || '');
            if (e2.code === 'ECONNRESET' || msg2.includes('ECONNRESET') || msg2.includes('timeout')) {
                console.log('\n[Aviso] Conexão caiu durante extração fallback. Aguardando...');
                await new Promise(res => setTimeout(res, 15000));
            } else {
                throw e2;
            }
        }
    }
}

async function renameEnv() {
    try {
        await classicFileop('unlink', `${APP_ROOT_PATH}/.env`);
    } catch {
        // Ignorar se não existir
    }
    await classicFileop('rename', `${APP_ROOT_PATH}/.env.production`, `${APP_ROOT_PATH}/.env`);
}

async function writeHtaccess(dir, content) {
    const legacyApi = axios.create({
        baseURL: `https://${CPANEL_HOST}:${CPANEL_PORT}/json-api/cpanel`,
        headers: { Authorization: `cpanel ${CPANEL_USER}:${API_TOKEN}` },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });

    const params = new URLSearchParams();
    params.append('cpanel_jsonapi_apiversion', '2');
    params.append('cpanel_jsonapi_module', 'Fileman');
    params.append('cpanel_jsonapi_func', 'savefile');
    params.append('dir', dir);
    params.append('filename', '.htaccess');
    params.append('content', content);

    const makeRequest = async () => {
        const res = await legacyApi.post('', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 0
        });
        if (res.data && res.data.cpanelresult && res.data.cpanelresult.error) {
            throw new Error(`cPanel API2 Error (savefile .htaccess em ${dir}): ${res.data.cpanelresult.error}`);
        }
    };

    try {
        await makeRequest();
    } catch (e) {
        const msg = (e.message || '');
        if (e.code === 'ECONNRESET' || msg.includes('ECONNRESET') || msg.includes('timeout') || msg.includes('socket hang up')) {
            console.log(`\n[Aviso] Conexão falhou ao salvar .htaccess em ${dir}. Tentando novamente em 3s...`);
            await new Promise(res => setTimeout(res, 3000));
            await makeRequest();
        } else {
            throw e;
        }
    }
}

async function updateHtaccessRules() {
    const rootHtaccess = `RewriteEngine On

# Preserve Authorization header for PHP / Laravel
RewriteCond %{HTTP:Authorization} .
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

RewriteRule ^(.*)$ public/$1 [L]`;

    const publicHtaccess = `<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
    RewriteCond %{HTTP:x-xsrf-token} .
    RewriteRule .* - [E=HTTP_X_XSRF_TOKEN:%{HTTP:X-XSRF-Token}]
    RewriteBase /
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^ index.php [L]
</IfModule>`;

    await writeHtaccess(`${APP_ROOT_PATH}/public`, publicHtaccess);
    await writeHtaccess(APP_ROOT_PATH, rootHtaccess);
}

async function cpanelDelete(files) {
    const filesStr = files.map(f => `${APP_ROOT_PATH}/${f}`).join(',');
    try {
        await classicFileop('trash', filesStr);
    } catch {
        await classicFileop('unlink', filesStr);
    }
}

// --- DEPLOY ---

async function runDeploy() {
    try {
        log('🔍 Verificando pré-requisitos...');

        if (!fs.existsSync(path.join(process.cwd(), '.env.production'))) {
            throw new Error('Ficheiro .env.production não encontrado! Cria-o a partir do .env.production.example');
        }
        logSuccess('.env.production encontrado');

        if (!API_TOKEN) throw new Error('CPANEL_API_TOKEN não está definido no .env local');

        const DEPLOYMENT_TOKEN = process.env.DEPLOYMENT_TOKEN;
        if (!DEPLOYMENT_TOKEN) throw new Error('DEPLOYMENT_TOKEN não está definido no .env local');

        log('🚀 Iniciando deploy...');

        log('🔨 Gerando assets frontend...');
        try {
            log('   -> npm run build');
            execSync('npm run build', { stdio: 'inherit' });
            logSuccess('Assets frontend gerados');
        } catch (e) {
            throw new Error(`Falha ao gerar assets frontend: ${e.message}`);
        }

        log('📦 Preparando dependências PHP de produção...');
        try {
            log('   -> composer install --optimize-autoloader --no-dev');
            execSync('composer install --optimize-autoloader --no-dev', { stdio: 'inherit' });
            logSuccess('Dependências PHP de produção preparadas');
        } catch (e) {
            throw new Error(`Falha ao preparar dependências PHP de produção: ${e.message}`);
        }

        log('📦 Criando laravel.zip...');
        if (fs.existsSync(SITE_ZIP)) fs.unlinkSync(SITE_ZIP);
        await zipLaravel(SITE_ZIP);
        const stats = fs.statSync(SITE_ZIP);
        logSuccess(`laravel.zip criado (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);

        log('🧹 Limpando servidor...');
        await cleanServer();
        logSuccess('Servidor limpo');

        log('⬆️  Upload de laravel.zip...');
        await uploadFile(SITE_ZIP, APP_ROOT_PATH);
        logSuccess('Upload concluído');

        log('📂 Extraindo ficheiros...');
        await extractZip(`${APP_ROOT_PATH}/laravel.zip`, `${APP_ROOT_PATH}`);
        logSuccess('Ficheiros extraídos');

        log('⚙️  Configurando .env...');
        await renameEnv();
        logSuccess('.env configurado');

        log('📝 Configurando .htaccess...');
        await updateHtaccessRules();
        logSuccess('.htaccess configurado');

        log('🗑️  Limpando temporários (servidor)...');
        await cpanelDelete(['laravel.zip']);

        log('🗑️  Limpando temporários (local)...');
        if (fs.existsSync(SITE_ZIP)) fs.unlinkSync(SITE_ZIP);
        logSuccess('Limpeza concluída');

        log('🔄 Executando comandos Artisan via deployment hook...');
        try {
            const hookRes = await axios.post(`https://${APP_DIR}/api/v1/deployment-hook`, {
                token: DEPLOYMENT_TOKEN
            }, {
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });
            logSuccess('Deployment hook concluído!');
            console.log(hookRes.data.output);
        } catch (e) {
            let errorMsg = e.message;
            if (e.response && e.response.data) {
                errorMsg = JSON.stringify(e.response.data);
            }
            logError(`Erro no deployment hook: ${errorMsg}`);
            throw e;
        }

        // Restaurar dependências dev localmente
        log('🔄 Restaurando dependências dev locais...');
        execSync('composer install', { stdio: 'inherit' });

        console.log(`\n✅ Deploy concluído! https://${APP_DIR}\n`);
    } catch (error) {
        let errMessage = error.message;
        if (error.response) {
            errMessage += `\nResponse Data: ${JSON.stringify(error.response.data)}`;
        }
        logError(`Erro durante o deploy: ${errMessage}`);
        process.exit(1);
    }
}

runDeploy();
