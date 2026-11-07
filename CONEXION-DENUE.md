# Activar DENUE principal — versión 0.6.0

La página pública deja de mostrar el bloque Geoapify / conexión privada del servidor. DENUE es la fuente principal de candidatos y Geoapify se utiliza solo como mapa complementario, mediante la API privada. No se piden claves a los visitantes.

## 1. Actualizar el código del Worker

El sitio ya apunta a https://sieu-shf-api.mario9407.workers.dev . No cambie esa URL en config.js.

Si Cloudflare despliega automáticamente desde TIvalor/sieu-shf, espere el despliegue de la nueva versión de main. Si lo creó pegando código en el panel, haga lo siguiente:

1. Abra https://dash.cloudflare.com/ y entre en Workers & Pages.
2. Seleccione el Worker sieu-shf-api.
3. Abra Edit code.
4. Sustituya el código del editor por TODO el contenido actualizado de worker/worker.js del repositorio https://github.com/TIvalor/sieu-shf . Ese archivo es autónomo; no pegue solo worker/handler.mjs.
5. Pulse Deploy. Las variables y secretos existentes se conservan: no borre GEOAPIFY_API_KEY.

## 2. Añadir el token de INEGI

1. En el mismo Worker, abra Settings.
2. En Variables and Secrets pulse Add.
3. Tipo: Secret.
4. Nombre EXACTO: DENUE_TOKEN.
5. Valor: el token correcto de la API DENUE de INEGI, sin comillas, sin texto adicional y sin espacios en los extremos. No use aquí la clave Geoapify.
6. Pulse Deploy para aplicar el cambio.

Mantenga esta configuración:

| Nombre | Tipo | Función |
|---|---|---|
| DENUE_TOKEN | Secret | Consulta principal INEGI |
| GEOAPIFY_API_KEY | Secret | Mapa Geoapify complementario |
| ALLOWED_ORIGINS | Text | https://tivalor.github.io |

La clave se ingresa directamente en Cloudflare. No la envíe al chat, no la guarde en GitHub y no la coloque en config.js. Si ya existía DENUE_TOKEN, puede reemplazarlo desde su edición de secretos; guarde y despliegue.

## 3. Comprobar la activación

Abra https://sieu-shf-api.mario9407.workers.dev/api/config . Debe devolver únicamente los indicadores:

```json
{"denueConfigured":true,"geoapifyConfigured":true}
```

Esto confirma que ambas variables están presentes, no que INEGI haya aceptado ya el token. Si denueConfigured continúa en false, revise el nombre exacto y el despliegue. Si /api/denue sigue respondiendo Ruta no disponible, el Worker aún tiene la versión anterior.

## 4. Prueba desde la página

1. Exporte antes de actualizar cualquier expediente que desee conservar.
2. Abra https://tivalor.github.io/sieu-shf/ y actualice con Ctrl+F5. El bloque de conexión Geoapify ya no debe aparecer.
3. Inicie un expediente nuevo con las coordenadas del inmueble o del lugar de prueba.
4. La fuente principal aparece como INEGI DENUE. Para la primera prueba seleccione Bancos y Hasta 3 cercanas.
5. Pulse Consultar DENUE. Verifique resultados con fuente INEGI DENUE, ID, CLEE y fecha de consulta, o un mensaje específico de error.
6. Pulse Mostrar mapa para visualizar los candidatos sobre la cartografía Geoapify. El mapa no genera candidatos ni cambia su fuente.
7. Para ampliar, seleccione Hasta 20 candidatas y repita la consulta. El Worker ordena el conjunto recibido de INEGI por distancia geodésica y muestra el límite solicitado dentro del radio, sin inventar puntos.
8. Valide y exporte JSON/CSV. Geoapify solo se consulta para las imágenes del mapa; los candidatos principales proceden de DENUE o captura/carga manual.

## Cobertura y errores

El catálogo conserva 22 conceptos. Hay 13 conceptos con consulta DENUE por palabra configurada y nueve que requieren fuente específica/manual. La correspondencia textual no verifica automáticamente escuelas, niveles de salud, transporte o función real. Los radios siguen en 2 km general y 800 m transporte. Los conceptos manuales no se convierten en ausencia por no tener consulta automática.

INEGI rechazó el token: revisar o sustituir la credencial DENUE. Respuesta no JSON / error de conexión: revisar el servicio e intentar de nuevo; no se concluye ausencia. Sin candidatos: indica no localizado en la consulta, no inexistencia comprobada.

El proyecto permanece en GitHub Pages + Cloudflare Workers Free, sin servicios Google. La cartografía Geoapify consume su cuota gratuita; conserve su plan Free y la atribución. No se activaron planes pagados.

## Referencias oficiales

- Método Buscar y parámetros: https://www.inegi.org.mx/servicios/api_denue.html
- Guardar secretos y desplegar: https://developers.cloudflare.com/workers/configuration/secrets/

Pruebas de código: 63 aprobadas. Navegador: nueve comprobaciones aprobadas con INEGI, claves y mapa simulados. La aceptación del token real debe verificarse después de guardar el Secret y desplegar el Worker.
