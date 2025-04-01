# Portal do Produtor - Gestão de Propriedades

Um sistema web para visualização e gerenciamento de propriedades rurais, permitindo aos produtores identificar facilmente informações sobre suas áreas, como matrícula, CAR, ITR e CCIR.

## Funcionalidades

- Visualização de mapas de propriedades com imagem de satélite do Google como fundo
- Importação de arquivos KML, KMZ e Shapefile (.shp em formato ZIP)
- Visualização de informações detalhadas de cada propriedade
- Gerenciamento de documentos associados às propriedades
- Interface intuitiva com suporte a arrastar e soltar arquivos

## Como usar

1. Abra o arquivo `index.html` em um navegador moderno
2. Clique no botão "Importar Arquivos" para selecionar um arquivo KML, KMZ ou Shapefile (.zip)
3. Alternativamente, arraste e solte os arquivos diretamente sobre o mapa
4. Clique em uma propriedade no mapa para visualizar seus detalhes
5. Use a lista de propriedades no menu lateral para navegar entre as áreas

## Tipos de arquivos suportados

- **KML** - Arquivos KML padrão (Google Earth, QGIS, etc.)
- **KMZ** - Arquivos KML compactados (geralmente exportados do Google Earth)
- **SHP** - Arquivos Shapefile (exportados de ferramentas GIS como QGIS ou ArcGIS)
  - Shapefile deve ser fornecido como um arquivo .ZIP contendo todos os componentes (.shp, .dbf, .shx, etc.)

## Campos de informação suportados

A aplicação identifica automaticamente os seguintes campos nos arquivos importados:

- Nome/Identificação da propriedade
- Área (calculada automaticamente em hectares)
- Matrícula (campo: MATRICULA ou Matricula)
- CAR - Cadastro Ambiental Rural (campo: CAR)
- ITR - Imposto Territorial Rural (campo: ITR)
- CCIR - Certificado de Cadastro de Imóvel Rural (campo: CCIR)

## Requisitos técnicos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexão à internet para carregamento das imagens de satélite
- JavaScript habilitado

## Desenvolvimento

Este projeto utiliza as seguintes tecnologias:

- Leaflet.js - Biblioteca de mapas interativos
- Leaflet-Omnivore - Plugin para importação de KML
- JSZip - Biblioteca para processamento de arquivos KMZ
- ShpJS - Biblioteca para processamento de arquivos Shapefile
- Leaflet-GeometryUtil - Utilitário para cálculos de área geodésica

## Licença

Todos os direitos reservados.

---

Desenvolvido para facilitar a gestão de propriedades rurais e acesso a documentação cartorial e tributária. 