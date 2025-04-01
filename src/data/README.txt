ESTRUTURA DE ARQUIVOS PARA CARREGAMENTO AUTOMÁTICO DE PROPRIEDADES

Para que o sistema carregue automaticamente as propriedades de cada produtor, siga estas orientações:

1. NOME DOS ARQUIVOS:
   - Os arquivos devem seguir o padrão: produtor_ID.kml
   - Onde "ID" é o identificador único do produtor
   - Exemplo: produtor_123.kml, produtor_456.kml

2. URL DE ACESSO:
   - Cada produtor deve acessar o sistema usando o parâmetro "produtor=ID" na URL
   - Exemplo: index.html?produtor=123

3. FORMATO DO KML:
   - O arquivo KML deve conter as propriedades (polígonos) do produtor
   - Os dados de matrícula, CAR, ITR e CCIR podem ser incluídos como ExtendedData, por exemplo:
   
   <ExtendedData>
     <Data name="MATRICULA">
       <value>12345</value>
     </Data>
     <Data name="CAR">
       <value>BR-1234567-ABCDEFGH</value>
     </Data>
     <Data name="ITR">
       <value>123456789</value>
     </Data>
     <Data name="CCIR">
       <value>987654321</value>
     </Data>
   </ExtendedData>

4. OBSERVAÇÕES:
   - Os dados também podem ser editados diretamente pelo produtor na interface
   - As alterações são salvas localmente no navegador do produtor
   - Para atualizar permanentemente os dados, é necessário gerar um novo arquivo KML

EXEMPLO DE ESTRUTURA DE PASTAS:
/src
  /data
    produtor_123.kml
    produtor_456.kml
    produtor_789.kml 