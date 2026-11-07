# Integración CLUES

Fuente oficial: https://gobi.salud.gob.mx/Bases_Clues.html
Archivo utilizado: https://gobi.salud.gob.mx/historico_clues/ESTABLECIMIENTO_SALUD_202609.xlsx?v=1.1
Corte: septiembre de 2026.

## Reglas
- Nivel 1, 2 y 3: CLAVE NIVEL ATENCION exactamente 1, 2 o 3. Nunca se infiere por nombre.
- Hospitales: CLAVE DEL TIPO ESTABLECIMIENTO 2 (hospitalización); nivel no especificado se conserva como tal.
- Solo estatus de operación 1 y tipos de establecimiento 1/2. Se excluyen unidades móviles, apoyo y otros tipos para no confundirlos con establecimientos fijos de atención.
- Coordenadas válidas y dentro de una envolvente de México (14–33 N, -119–-86 E). Coordenadas ausentes se excluyen; las coordenadas presentes aún requieren revisión humana.
- Hasta tres más cercanos por categoría dentro de 2 km; selección ampliada hasta veinte. No se rellenan opciones si hay menos.
- DENUE complementa hospitales con consulta textual; no asigna niveles de atención. Los registros de ambas fuentes se conservan por separado para permitir contrastarlos.
- Candidatos sin verificación automática. La revisión exige responsable, fecha, fuente, referencia y alcance. Nivel de atención CLUES y nivel SHF son campos distintos.
- JSON conserva CLUES, institución, nivel declarado, tipo, tipología, domicilio, estatus y corte. CSV incluye CLUES, institución, nivel, estatus y corte. La bitácora identifica cada consulta y sus errores.

## Actualización reproducible
1. Revisar el catálogo mensual más reciente en el portal oficial y descargar el XLSX en data/CLUES-202609.xlsx (cambiar nombre y corte en los scripts para otra versión).
2. En PowerShell ejecutar: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/extract-clues.ps1
3. Ejecutar npm run build:clues. Se generan 32 archivos comprimidos y un manifiesto con hash, conteo y límites. El XLSX y el JSON intermedio no se publican.
4. Ejecutar npm test y la prueba de interfaz. Revisar conteos, niveles y puntos de referencia conocidos; publicar catálogo y manifiesto juntos.
5. Conservar el corte anterior para trazabilidad de expedientes exportados. No presentar el catálogo como disponibilidad en tiempo real.

## Probar en la página
1. Exportar el expediente actual antes de recargar.
2. Capturar coordenadas y Aplicar ubicación, o usar GPS estando en el inmueble.
3. Seleccionar Servicios de salud primer, segundo o tercer nivel; pulsar Consultar equipamiento.
4. Revisar tres opciones o ampliar hasta veinte. Abrir Validar esta opción y comprobar ubicación, nivel, operación y correspondencia con el dictamen.
5. Registrar responsable, fecha y alcance; marcar revisión humana solo al completar la comprobación. Exportar JSON/CSV.

Costo de esta integración: archivos estáticos públicos de GitHub Pages; CLUES no requiere token. DENUE y mapa conservan sus secretos y cuotas existentes.
