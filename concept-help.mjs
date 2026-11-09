export const SHF_REFERENCE={title:'SHF: metodología de valuación, modificación publicada el 24/02/2012, apartado 2.9',url:'https://www.gob.mx/cms/uploads/attachment/file/127548/13._Modif._a_Reglas_de_Car_cter_General_que_establecen_la_Metodolog_a_para_la_Valuaci_n_de_Inmuebles_Objeto_de_CrC_ditos_Garantizados_a_la_Vivienda__DOF_24-febrero-2012_.pdf'};
const descriptions={
 templo:'Edificio o espacio destinado al culto religioso con uso regular. Compruebe que funciona como templo y que su ubicación corresponde al entorno del inmueble.',
 comunitario:'Instalación para actividades, talleres o servicios comunitarios. Una oficina administrativa o un salón privado no acreditan por sí solos esta función.',
 plaza:'Espacio público abierto para encuentro, convivencia o actividades cívicas. Distinga una plaza pública de un centro o plaza comercial.',
 parque:'Espacio abierto de uso recreativo con áreas verdes o instalaciones de estancia. Compruebe acceso y uso efectivo; un terreno baldío no basta.',
 jardin:'Área verde acondicionada para paseo, descanso u ornato. Confirme su función de equipamiento del entorno; no confunda con el jardín privado de una vivienda.',
 primaria:'Plantel que imparte educación primaria. Compruebe nivel y operación; registros de turnos distintos pueden corresponder a la misma sede.',
 secundaria:'Plantel que imparte educación secundaria. Confirme el nivel educativo y la sede, especialmente si la fuente solo lo clasifica como escuela.',
 preparatoria:'Plantel de educación media superior, como bachillerato o preparatoria. No clasifique por el nombre sin comprobar la oferta educativa.',
 universidad:'Plantel o campus de educación superior. Verifique que se imparten estudios de ese nivel y que la sede se encuentra operando.',
 otras_escuelas:'Establecimiento educativo que no encaja en las categorías anteriores. Registre y confirme el tipo de enseñanza, evitando contar dos veces una misma sede.',
 salud1:'Unidad de atención ambulatoria o primer contacto. Confirme el nivel 1 declarado en CLUES y la operación actual; el nombre del establecimiento no basta.',
 salud2:'Unidad de atención hospitalaria general o de especialidad. Confirme expresamente el nivel 2 en CLUES o en otra evidencia institucional.',
 salud3:'Unidad de atención de alta especialidad. Exija evidencia institucional del nivel 3; no lo deduzca de la palabra hospital ni de su tamaño.',
 hospital:'Establecimiento de atención hospitalaria. Confirme hospitalización, ubicación y operación. Su identificación como hospital no determina por sí sola el nivel de atención.',
 comercio:'Locales físicos que ofrecen bienes o servicios. Indique distancia central, franja y cantidad observada; varios registros económicos pueden corresponder al mismo local o inmueble.',
 mercado:'Conjunto organizado de puestos o locales de abasto. Compruebe que corresponde al tipo de mercado solicitado y su operación, distinguiéndolo de una tienda aislada.',
 supermercado:'Establecimiento de autoservicio con oferta amplia de alimentos y productos de consumo. Compruebe el giro; una tienda pequeña no equivale automáticamente a supermercado.',
 banco:'Sucursal que presta servicios bancarios presenciales. Un cajero automático aislado no acredita por sí solo la existencia de una sucursal.',
 cancha:'Área acondicionada para practicar un deporte, como fútbol, básquetbol o voleibol. Verifique uso, acceso y ubicación; distinga la cancha de un predio sin acondicionar.',
 deportivo:'Instalación o conjunto de instalaciones para actividades deportivas. Compruebe su función y operación; distíngalo de una cancha aislada cuando el dictamen lo requiera.',
 urbano:'Identifique el punto efectivo de abordaje de transporte urbano y su distancia a la vivienda. Confirme ruta, operación y frecuencia estimada de paso.',
 suburbano:'Identifique el punto de abordaje de transporte que conecta la ciudad con zonas periféricas o localidades cercanas. Confirme tipo de servicio, distancia y frecuencia.'
};
export const CONCEPT_HELP=Object.fromEntries(Object.entries(descriptions).map(([id,description])=>[id,{description,basis:['urbano','suburbano'].includes(id)?'Criterio SHF: registrar transporte y distancia de abordaje. Tipo de servicio y frecuencia: orientación operativa del proyecto.':'Orientación operativa del proyecto; no es una definición individual de SHF.',...(['urbano','suburbano'].includes(id)?{reference:SHF_REFERENCE}:{})}]));
