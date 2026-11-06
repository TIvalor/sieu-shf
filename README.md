# SIEU-SHF — GitHub Pages + Cloudflare Workers Free

Aplicación pública de equipamiento urbano para avalúos de vivienda. Esta versión 0.5.0 se publica desde GitHub y no depende de Google Cloud, Firebase, Google Maps ni Sites. La clave de Geoapify permanece como Secret del Worker, no en GitHub ni en el navegador de los visitantes.

## Arquitectura y costo

- GitHub Pages: página estática pública bajo la cuenta TIvalor, igual que el frontend MKWKO-score-web.
- Cloudflare Workers Free: consultas Geoapify y teselas del mapa; clave privada en el alojamiento.
- Geoapify Free: fuente de candidatos y mapa OpenStreetMap con atribución.
- Dominio propio: innecesario. Se usan subdominios github.io y workers.dev.

Objetivo de operación: $0 usando solo planes Free y dentro de sus cuotas. No es uso ilimitado. Al revisar el 6 de noviembre de 2026: Geoapify anuncia 3,000 créditos/día y hasta 5 peticiones/segundo; Workers Free anuncia 100,000 solicitudes/día. Los créditos de Places y mapa no son idénticos: revise el consumo de su proyecto. No seleccione planes pagados ni ampliaciones de facturación para este entregable.

Fuentes: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site ; https://developers.cloudflare.com/workers/platform/pricing/ ; https://www.geoapify.com/pricing/ ; https://www.geoapify.com/pricing-details/.

## 1. Repositorio GitHub

1. En https://github.com/new cree un repositorio público en TIvalor con nombre sieu-shf. No use el repositorio de Mario Kart para este proyecto.
2. Suba el contenido completo de esta carpeta a la raíz del repositorio: index.html debe quedar directamente en la raíz, no dentro de otra carpeta sieu-shf-github.
3. Incluya config.js, los módulos .mjs, style.css, vendor/ y .nojekyll. También puede subir worker/, scripts/, test/ y esta documentación: no contienen credenciales reales.
4. En Settings > Pages seleccione Deploy from a branch, main, / (root), Save.
5. Espere la publicación. La dirección prevista, si mantiene esos nombres, es https://tivalor.github.io/sieu-shf/ . Esta dirección es prevista, no prueba de que ya esté publicada.

El paquete funciona sin configurar la API para demo ficticia y captura manual. No publique claves de servidor, .env, .dev.vars, archivos cifrados DPAPI ni claves privadas. GitHub Pages no ejecuta server.mjs ni oculta secretos de backend.

## 2. Crear el Worker gratuito

1. Abra https://dash.cloudflare.com/ con su cuenta. Use Workers Free.
2. Entre a Workers & Pages y cree una aplicación Worker. La guía oficial permite empezar con Hello World o conectar un repositorio Git.
3. Nombre recomendado: sieu-shf-api. Publique el ejemplo inicial para obtener el subdominio workers.dev.
4. Abra Edit code y reemplace el código inicial por el contenido COMPLETO de worker/worker.js de este paquete. Es un archivo autónomo que no necesita imports ni instalación de paquetes. Guarde y despliegue.
5. Copie la URL real que Cloudflare asignó al Worker. No comparta la clave: solo necesitamos esa URL pública.

Alternativa con integración Git: seleccione este repositorio y wrangler.toml; el entrypoint ya es worker/worker.js. Los pasos exactos del panel pueden variar. Referencia: https://developers.cloudflare.com/workers/get-started/dashboard/.

## 3. Guardar la clave de Geoapify como Secret

Use una clave de Geoapify creada para servidor, separada de la clave de navegador. Una restricción Allowed origins o HTTP referrer de navegador puede bloquear llamadas de servidor. Cloudflare no proporciona aquí una IP de salida fija; no invente una restricción por IP. Mantenga privada la clave y controle la cuota Free en Geoapify.

1. En Cloudflare abra Workers & Pages > su Worker > Settings.
2. En Variables and Secrets pulse Add.
3. Tipo: Secret. Nombre EXACTO: GEOAPIFY_API_KEY. Valor: su clave Geoapify.
4. Añada otra variable, tipo Text, nombre ALLOWED_ORIGINS, valor https://tivalor.github.io (sin ruta /sieu-shf/ y sin barra final).
5. Pulse Deploy para aplicar. Si publica bajo otra cuenta GitHub, cambie ese origen para que corresponda al dominio github.io de esa cuenta.

Referencia oficial: https://developers.cloudflare.com/workers/configuration/secrets/.

La clave se ingresa directamente en Cloudflare. No la pegue en el chat ni en config.js, wrangler.toml, README, Issues, GitHub Secrets usados para generar JavaScript público, ni archivos subidos al repositorio.

## 4. Conectar la página con el Worker

Edite únicamente config.js, sustituyendo la cadena vacía por la URL real del Worker, sin barra final:

```javascript
window.SIEU_CONFIG = {
  apiBase: "https://URL-REAL-DE-SU-WORKER.workers.dev"
};
```

El valor anterior es un ejemplo de estructura, no una URL asignada. Esta URL no es una credencial. Guarde el cambio en main y espere que Pages vuelva a publicar.

## 5. Prueba final

1. Abra la dirección de Pages en ventana privada u otro equipo.
2. Debe mostrar Geoapify: servidor configurado. No debe pedir API key a los visitantes.
3. Pulse Activar mapa Geoapify: las teselas pasan por el Worker, sin clave en la URL del navegador.
4. Capture coordenadas del inmueble, GPS estando en él o un punto del mapa. Confirme con Aplicar ubicación.
5. Seleccione Geoapify, Bancos, Hasta 3 cercanas y consulte.
6. Para ampliar, seleccione Hasta 20 y consulte la misma categoría. Valide un candidato y exporte JSON/CSV.
7. Exporte antes de recargar. Los expedientes siguen en memoria del navegador, sin sincronización entre usuarios ni base de datos compartida.

Si falla: /api/config en la URL del Worker informa solo disponibilidad, nunca la clave. Un 403 en llamadas desde la página indica revisar ALLOWED_ORIGINS; un 503 indica Secret ausente; un 429 indica frecuencia/cuota; un 502 requiere revisar Geoapify, clave de servidor y cuota. Una consulta fallida no prueba inexistencia.

## Funciones y límites

22 conceptos; radios generales 2 km y transporte 800 m; tres candidatos por proximidad, expansión, fuentes, revisión humana, estados de ausencia/no localizado/conflicto y exportaciones. 17 conceptos tienen correspondencia Geoapify orientativa; cinco siguen por fuente específica/manual. Primaria/secundaria/preparatoria y tipo de transporte requieren validar clasificación. El mapa es de calles, no satelital.

No se asigna nivel SHF sin evidencias completas y regla documentada validada. El sistema no tiene aval institucional ni certifica vigencia de establecimientos. Distancia geodésica esférica aproximada, no recorrido vial.

El Worker añade caché de consultas de 90 segundos, caché de teselas según cabeceras, separación de orígenes y límites temporales por IP/instancia. CORS no autentica clientes ajenos al navegador; estos controles no sustituyen la cuota global del proveedor. Mantenga ambos servicios en Free para el objetivo $0. No se configuró ninguna suscripción pagada.

## Pruebas

```text
npm test
```

55 pruebas unitarias/de contrato sin dependencias. La prueba de navegador usa Playwright temporal:

```text
npm install --no-save --package-lock=false playwright
node scripts/browser-qa.mjs
```

Requiere Microsoft Edge instalado. Son 9 comprobaciones bajo una ruta /sieu-shf/, con API separada, mapa por proxy y clave ausente de red/exportaciones del navegador. Datos y clave simulados. qa/github-pages.json documenta la ejecución. La prueba real depende de sus despliegues y su Secret.

Para regenerar el Worker después de cambiar core.mjs o geoapify.mjs:

```text
npm run build:worker
```

No publique node_modules. vendor/leaflet.js y vendor/leaflet.css ya están incluidos; su licencia está en vendor/LEAFLET-LICENSE.txt.
