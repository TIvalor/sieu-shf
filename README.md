# SIEU-SHF — CLUES para salud, DENUE y mapa Geoapify

Versión 0.7.0. Aplicación pública de equipamiento urbano para avalúos de vivienda, alojada en GitHub Pages y conectada a Cloudflare Workers Free. Sin Google Cloud, Google Maps, Firebase ni dependencia de Sites.

## Comportamiento publicado

- CLUES es la fuente principal para salud1, salud2, salud3 y hospital. DENUE complementa hospitales y consulta los demás rubros compatibles; seis conceptos requieren fuente específica o captura manual.
- Geoapify sirve el mapa OpenStreetMap y complementa exclusivamente categorías no localizadas, con hasta tres candidatos pendientes de revisión.
- El bloque de configuración Geoapify se retiró del HTML; los visitantes no introducen claves ni ven instrucciones de alojamiento.
- Tres opciones cercanas por categoría, expansión hasta veinte, radios 2 km general y 800 m transporte.
- Fuente, ID, CLEE, fecha, distancia y revisión humana. Los resultados vacíos y errores no se interpretan como inexistencia.
- Exportación JSON/CSV/tabla, sesión en memoria y propuesta de nivel SHF condicionada a evidencia suficiente y regla documentada validada.

**Para activar la conexión y desplegar el código del Worker siga [CONEXION-DENUE.md](CONEXION-DENUE.md).**

## Publicación actual

- Repositorio: https://github.com/TIvalor/sieu-shf
- Página: https://tivalor.github.io/sieu-shf/
- API configurada: https://sieu-shf-api.mario9407.workers.dev

config.js contiene únicamente la URL pública del Worker, nunca claves. index.html debe permanecer en la raíz del repositorio, con rutas relativas y .nojekyll. GitHub Pages se configura con Settings > Pages > Deploy from a branch > main > / (root).

El Worker se publica desde worker/worker.js, archivo autónomo generado. Si Cloudflare está conectado a GitHub, despliegue main; si usa el editor manual, sustituya todo el código con ese archivo y pulse Deploy. Cambiar GitHub no actualiza automáticamente un Worker creado mediante copia manual.

## Configuración privada

En Cloudflare, Worker sieu-shf-api > Settings > Variables and Secrets:

| Nombre | Tipo | Función |
|---|---|---|
| DENUE_TOKEN | Secret | Consulta principal INEGI DENUE |
| GEOAPIFY_API_KEY | Secret | Imágenes del mapa complementario |
| ALLOWED_ORIGINS | Text | https://tivalor.github.io |

Conserve la clave Geoapify existente. Añada o actualice únicamente DENUE_TOKEN con la clave correcta de esa API. Pulse Deploy. Las credenciales no se guardan en el repositorio, no se entregan al navegador y no forman parte del expediente exportado.

/api/config informa solo presencia de variables. denueConfigured=true no certifica que INEGI acepte el token: compruébelo con una consulta de Bancos. La guía describe los errores de credencial rechazada, formato y red.

## Costo objetivo $0

Use repositorio público GitHub Free, Cloudflare Workers Free y Geoapify Free, sin dominio propio ni planes pagados. El servicio está sujeto a cuotas. Al revisar el 6 de noviembre de 2026: Geoapify anuncia 3,000 créditos/día y hasta 5 solicitudes/segundo; Workers Free anuncia 100,000 solicitudes/día. DENUE se consulta mediante token del servicio INEGI. No se garantiza disponibilidad ilimitada.

El Worker conserva caché de consultas de 90 segundos, caché de imágenes según cabeceras y límites temporales por IP/instancia. CORS no autentica clientes fuera del navegador y no sustituye la cuota global. Mantenga los planes Free y supervise el consumo.

## Uso

1. Abra la página y cree un expediente nuevo con sus coordenadas.
2. Seleccione una categoría compatible, por ejemplo Bancos, y pulse Consultar DENUE.
3. Abra Mostrar mapa para revisar el entorno. Un clic del mapa prepara coordenadas pendientes de aplicar.
4. Valide la correspondencia, ubicación y operación del candidato; documente referencia, responsable, fecha y alcance.
5. Exporte antes de recargar o cerrar. No hay base compartida de expedientes ni sincronización entre usuarios.

Las distancias son geodésicas esféricas aproximadas, no recorridos viales. El mapa es de calles, no satelital. La cartografía no demuestra que un establecimiento opere. Los 22 conceptos y las reglas de nivel requieren revisión profesional; el sistema no tiene aval institucional SHF.

## Desarrollo y pruebas

```text
npm test
npm run build:worker
```

La compilación une core.mjs, worker/denue.mjs y worker/handler.mjs en worker/worker.js. Después de modificar esos archivos regenere el Worker antes de desplegar.

Prueba opcional de navegador con Microsoft Edge:

```text
npm install --no-save --package-lock=false playwright
node scripts/browser-qa.mjs
```

72 pruebas unitarias/contrato y 14 comprobaciones de navegador aprobadas: CLUES con catálogo oficial real; DENUE y mapa simulados. Geoapify Places se utiliza como respaldo de categorías compatibles sin hallazgos previos. También se verificaron las cuatro categorías de salud en la página pública, con cero errores de consulta y sin verificaciones humanas automáticas; véase qa/clues-live.json.

Leaflet 1.9.4 se incluye con licencia BSD-2-Clause en vendor/LEAFLET-LICENSE.txt. El mapa muestra atribución a Geoapify y OpenStreetMap.

## Referencias

- https://www.inegi.org.mx/servicios/api_denue.html
- https://developers.cloudflare.com/workers/configuration/secrets/
- https://developers.cloudflare.com/workers/platform/pricing/
- https://www.geoapify.com/pricing/
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Catálogo oficial CLUES

Consulte [INTEGRACION-CLUES.md](INTEGRACION-CLUES.md). Corte septiembre de 2026: 64,586 registros originales; 37,218 establecimientos elegibles en 32 entidades. Se usan solo consulta externa u hospitalización, estatus EN OPERACION y coordenadas válidas en México. El nivel se toma del campo oficial; valores no especificados no se infieren. El estado del catálogo no demuestra operación actual.

Los archivos comprimidos de data/ se consultan desde GitHub Pages sin clave adicional ni consumo del Worker. Se cargan todas las entidades cuyos límites intersectan el radio de 2 km, incluidas zonas fronterizas entre entidades. Se comprueba SHA-256 antes de descomprimir. Una descarga fallida se muestra como error y no se interpreta como ausencia. Requiere navegador moderno con DecompressionStream y HTTPS.

Pruebas: npm test (72 pruebas). Prueba de interfaz: node scripts/browser-qa.mjs. Reconstrucción Worker: npm run build:worker.

## Versión 0.8.0: captura y revisión ágil

Indique el responsable una vez. En Validación rápida elija un candidato y pulse Validar: Existe. La fuente, referencia, fecha y método estándar se conservan automáticamente. Puede elegir otra opción o Dejar pendiente. No existe requiere una explicación breve de cómo comprobó la ausencia en todo el radio. No se infiere de consultas vacías. La revisión detallada permanece disponible; sus campos adicionales son opcionales para candidatos encontrados.

Descargar Excel para captura genera un XLSX nativo: Captura contiene Categoría, Existencia y Distancia (m), con 22 filas, filtro, encabezado fijo y selector Existe/No existe. Pendientes y conflictos dejan la existencia vacía, y la distancia queda vacía para ausencia o pendientes; cero se reserva para distancia cero real. Evidencia conserva el elemento elegido y procedencia. Instrucciones identifica inmueble, uso y límites. Copiar resumen para captura permite pegar las mismas tres columnas en otros sistemas. Las ediciones hechas en Excel no se reimportan como verificadas.

Validación: 76 pruebas unitarias y comprobaciones de navegador de elección de candidato, ausencia confirmada, retirada de revisión y descarga XLSX.

## Versión 0.9.0: revisión por grupos y distancia declarada

Categorías agrupadas en comunidad y espacios públicos, educación, salud, comercio y servicios, deporte y transporte. Cada fila permite indicar una distancia manual sin nombre ni coordenadas, identificada como declaración del valuador. Se acepta de 0 a 2,000 m en general y de 0 a 800 m para transporte. No se inventan POI para estas distancias.

Transporte urbano y suburbano incluyen frecuencia estimada de paso positiva en minutos. Locales comerciales incluye cantidad entera positiva en la franja [distancia -100, distancia +100] m, recortada al radio 2 km. El botón de conteo propone el número de registros encontrados en esa franja; el valuador confirma o corrige el número de locales físicos. Los registros DENUE pueden no equivaler a locales físicos únicos y la consulta textual no garantiza cobertura exhaustiva.

Comercio conserva todos los resultados válidos devueltos por la consulta, sin recorte a tres o veinte. El resto mantiene sus límites. Excel y copiar resumen agregan frecuencia y cantidad, con celdas vacías fuera de las categorías correspondientes.

El mapa se vuelve flotante al desplazar la página, con botón para desactivarlo. Al pulsar una fila sus POI se resaltan en violeta y los otros permanecen atenuados.

Pruebas: 79 unitarias.

## Versión 0.10.0: mapa ampliable y respaldo cartográfico

Maximizar mapa amplía el visor desde su posición flotante o inicial. Minimizar mapa o Escape restablecen la posición de revisión; se conserva el centro y el zoom.

Completar no localizados con Geoapify está activado inicialmente y puede desmarcarse. DENUE y CLUES conservan prioridad. Solo si la categoría sigue No localizado se consulta Geoapify Places mediante el Worker y su secreto existente GEOAPIFY_API_KEY. También hay un botón por fila para categorías compatibles sin candidatos. El respaldo siempre solicita y devuelve como máximo tres, incluido comercio, independientemente del límite de DENUE. Candidatos o ausencias verificadas bloquean ese respaldo. No se deducen niveles de atención ni equivalencias exactas de escuelas o transporte a partir de la categoría amplia de OpenStreetMap. Las categorías sin correspondencia cartográfica suficiente conservan la captura manual.

El Worker aplica CORS, caché independiente por proveedor, ritmo y cuota, y no publica la clave. Fuente API: https://apidocs.geoapify.com/docs/places/ . Una búsqueda vacía no demuestra ausencia y cada candidato requiere revisión humana.

Comercio: indicar distancia central (0 a 2,000 m) y franja a cada lado (± 0 a 2,000 m). El conteo abarca [distancia-franja, distancia+franja], recortado al radio de 2,000 m. El ancho inicial es ±100 m. JSON, Excel y resumen copiable conservan distancia central, cantidad y franja elegida. El conteo sugerido de registros no certifica locales físicos únicos.

Pruebas: 81 unitarias y 25 comprobaciones de navegador.

## Versión 0.11.0: identificación y revisión compacta

Los 22 conceptos muestran un botón de información i, accesible con mouse, foco de teclado o pulsación en móvil. Las descripciones son orientaciones operativas del proyecto. El criterio SHF de transporte y distancia de abordaje se distingue y enlaza a la modificación de metodología de 24/02/2012, apartado 2.9. No se presentan las 22 orientaciones como definiciones oficiales de SHF ni se certifica la vigencia normativa completa. No se verificó una definición individual SHF para cada rubro.

Cada fila tiene lista de candidatos con desplazamiento interno (altura máxima 220 px). Se muestran nombre, distancia y fuente; las claves y referencias solo aparecen en el panel del candidato seleccionado. Seleccionar un candidato no lo verifica. Los bordes de color indican revisión pendiente o verificada; los estados también tienen nombre accesible y una leyenda persistente. Los detalles permanecen disponibles en Editar detalles.

Comercios exige cantidad, distancia central y franja capturada por el revisor al pulsar Validar: Existe o Validar distancia manual. No hay valor predeterminado de 100 m en la validación, el campo inicia vacío y el valor capturado se conserva en JSON y Excel. La validación no modifica la franja por la distancia del POI.

Pruebas: 83 unitarias y 28 comprobaciones de navegador.
