# Zen-Tech - Documentação
<div align="center">
<img  alt="pulseira-icon" src="./app/assets/pulseira-icon.png" height="900px" width="400px">
</div>

<span  id="topo">
<br>
<p  align="center">
<a  href="#sobre">Sobre o Projeto</a> |
<a  href="#backlogs">Product Backlog</a> |
<a  href="#sprint">Entrega de Sprints</a> |
<a  href="#tecnologias">Tecnologias</a> |
<a  href="#equipe">Nossa Equipe</a> |
</p>
<span  id="sobre">  
<br>


<div>
<h2>
Sobre o Projeto :📋 
</h2>
<p>
Sistema de Detecção de Quedas para Idosos.
<p>
Muitas pessoas em idade avançada permanecem sozinhas em casa, o que aumenta o risco em casos
de queda.<br>
<p>
O Bio Alert é uma solução tecnológica desenvolvida pela Zentech para aumentar a segurança de idosos que permanecem sozinhos em casa. O sistema utiliza sensores 
inteligentes, pela pulseira, para detectar automaticamente quedas e acionar rapidamente mecanismos de alerta, garantindo socorro imediato em situações de emergência.
</p>

**Objetivo Principal:**
<p>O objetivo é especificar e implementar um sistema que detecte automaticamente quedas e envie
os dados via Wi-Fi para um aplicativo mobile de monitoramento. O sistema também deverá emitir
alertas por SMS para um número previamente cadastrado sempre que for detectada uma
ocorrência classificada como queda.</p>


**Principais Funcionalidades:**
- 🛡️  Sistema de Cadastro e Vinculação  
- ⚠️  Detecção Automática de Quedas
- 💬  Alertas Imediatos por SMS
- 🚨  Alerta queda(pulseira)  
- 📱  Interface simples e responsiva
<h2>

 Protótipo do Projeto : 📱
</h2>
Figma (wireframe):<a href="https://share.google/fCjJlhN0PqWNUljTA">Clique Aqui!</a>
<br/>

</div>
<div>
<h2>
 Jornada do usuário :
</h2>
 
 [Jornada do usuário ](./EU/EU-02-PersonaEJornadaDoUsuário-Modelo.pdf)



<br>

##### [🔝 Voltar ao topo ](#topo)

<h2 id="sprint">
Entregas de Sprints e Tasks :
</h2>

Todas as entregas serão realizadas conforme os prazos acordados com o cliente. Para cada ciclo de desenvolvimento, será gerado um relatório completo por sprint e uma planilha de tarefas, na aba Tasks, que detalha cada atividade executada, o responsável, a data de conclusão e uma descrição do trabalho realizado. A relação detalhada das sprints e tarefas é apresentada abaixo.

<div align="center">

| Sprint | Previsão de Entrega | Status | Relatório | Tasks |
| ------ | -------------------- | ------ | --------- |-------|
|   1    | 📅 07/10/2025        | :white_check_mark:| [:round_pushpin: Ver Relatório](./Sprint01.md) |[:round_pushpin: Ver Relatório](./taskSprint1.md) |
|   2    | 📅 04/11/2025        |:construction: | [:round_pushpin: Ver Relatório]() | [:round_pushpin: Ver Relatório](./taskSprint2.md)|
|   3    | 📅 25/11/2025        | [-]| [:round_pushpin: Ver Relatório]() | [:round_pushpin: Ver Relatório]()|

</div>

Legenda:
- :white_check_mark: **Finalizada**
- :construction: **Em Progresso**
- [-] **Não iniciado**

A apresentação da Sprint 1 em vídeo por ser acessada por [aqui!](https://www.youtube.com/watch?v=f40Za_Fj7MA) 

<br>

##### [🔝 Voltar ao topo ](#topo)



<div>
<span  id="backlogs">
<h2>
Product Backlog :
</h2>
  <div align="center">
   
|item  | Funcionalidade                     | Descrição                                                                                   | Prioridade |
|----------|------------------------------------|---------------------------------------------------------------------------------------------|------------|
|RNF - EU  |	**Protótipo Figma - Wireframe**	|	Protótipo das telas do app no Figma	|	ALTA	|	
|RNF - PD |	**Protótipo de telas - ExpoGo**		|	Protótipo de telas no ExpoGo utilizando React Native |	ALTA	|
|RNF - IE |	**Organização - Github**	|	Início de documentação e início da implantação das regras CI/CD			|	ALTA	|
|RNF - |	**Backlog Priorizado**		|	Criar backlog priorizado por Sprints				|	ALTA	|
|	|**Wireframe do Aplicativo**	|		Criar estrutura básica do wireframe			|	ALTA	|
|RF	|**Protótipo das páginas**		|	Desenvolver páginas de Home, Início, Cadastro e Menu		|	ALTA	|
|RNF	|**Jornada do Usuário**		|	Documentar requisito solicitado pelo professor (Jornada do Usuário)|	ALTA	|
|RF	|**Página Configuração de Emergência**| 	Criar página para configuração de contatos de emergência	|	ALTA	|
|RNF	|**Desenvolvimento da Logo**	|	Criar identidade visual do aplicativo				|	MÉDIA	|
|RNF	|**Modelagem do Banco de Dados**	|	Criar UML do banco de dados					|	ALTA	|
|RNF	|**Implementação MongoDB**		|	Configurar MongoDB em ambiente de nuvem				|	ALTA	|
|RNF	|**Análise de Sensores**		|	Levantar pontos positivos/negativos MPU6050 e MPU9250		|	ALTA	|
|RNF	|**Montagem do Circuito**		|	Montar circuito ESP32 + acelerômetro				|	ALTA	|
|RNF	|**Teste de Alimentação**		|	Testar alimentação do sensor via 3.3V				|	ALTA	|
|RNF	|**Comunicação I2C**		|		Verificar comunicação I2C entre ESP32 e sensor		|	ALTA	|
|RNF	|**Ajuste Endereçamento**		|	Ajustar endereçamento I2C do sensor				|	ALTA	|
|RNF	|**Ambiente de Desenvolvimento**	|	Configurar Arduino IDE/PlatformIO				|	ALTA	|
|RF	|**Sketch Base ESP32**		|	Criar sketch base para o ESP32					|	ALTA	|
|RF	|**Importar Biblioteca**		|	Importar e configurar biblioteca do sensor			|	ALTA	|
|RF	|**Leitura Dados Acelerômetro**	|	Validar leitura de dados crus do acelerômetro (ax, ay, az)	|	ALTA	|
|RF	|**Leitura Dados Giroscópio**	|	Validar leitura de dados crus do giroscópio (gx, gy, gz)	|	ALTA	|
|RNF	|**Esquema Elétrico**		|	Documentar esquema elétrico completo				|	MÉDIA	|
|RF	|**Normalização de Dados**		|	Normalizar valores lidos (g's e °/s)				|	ALTA	|
|RF	|**Calibração Acelerômetro**	|		Implementar calibração do acelerômetro			|	ALTA	|
|RF	|**Calibração Giroscópio**		|	Implementar calibração do giroscópio				|	ALTA	|
|RNF	|**Log Serial Debug**		|	Criar log serial para debug dos dados				|	MÉDIA	|
|RNF	|**Vídeo Validação Movimento**	|	Gravar vídeo de teste de movimento para validação		|	MÉDIA	|
|RF	|**Cálculo Magnitude Aceleração**	|	Implementar cálculo da magnitude da aceleração			|	ALTA	|
|RF	|**Definir Thresholds**		|	Definir thresholds iniciais para detecção de queda		|	ALTA	|
|RF	|**Detecção Pico Aceleração**	|	Criar função para identificar pico de aceleração		|	ALTA	|
|RF	|**Detecção Ausência Movimento**	|	Implementar detecção de ausência de movimento pós-pico		|	ALTA	|
|RF	|**Classificação Queda**		|	Combinar regras simples para classificar queda			|	ALTA	|
|RF	|**Teste Thresholds**		|	Testar diferentes thresholds (2.5g, 3g, 3.5g)			|	ALTA	|
|RF	|**Validação Movimentos Normais**	|	Validar com simulação de movimentos normais (andar, sentar)	|	ALTA	|
|RNF	|**Resultados Calibração**		|	Documentar os resultados da calibração				|	MÉDIA	|
|RF	|**Conexão Wi-Fi**			|	Configurar conexão do ESP32 com rede Wi-Fi local		|	ALTA	|
|RF	|**Reconexão Automática**		|	Implementar rotina de reconexão automática			|	ALTA	|
|RF	|**Envio HTTP POST**		|		Criar envio básico via HTTP POST para servidor de testes|	ALTA	|
|RF	|**Payload JSON**			|	Criar payload JSON com dados do evento				|	ALTA	|
|RF	|**Validação Envio Tempo Real**	|	Validar envio em tempo real (Serial + servidor)			|	ALTA	|
|RNF	|**Endpoint API**			|	Documentar endpoint usado para envio				|	MÉDIA	|
|RF	|**Simulação Quedas Reais**		|	Simular quedas reais (deixar objeto cair com sensor)		|	ALTA	|
|RF	|**Coleta Dados Cenários**		|	Coletar dados de diferentes cenários (queda vs movimento normal)|	ALTA	|
|RF	|**Validação Falsos Positivos**	|	Validar taxa de falsos positivos				|	ALTA	|
|RF	|**Validação Falsos Negativos**	|	Validar taxa de falsos negativos				|	ALTA	|
|RNF	|**Estabilidade Conexão**		|	Testar estabilidade da conexão Wi-Fi (> 1h)			|	ALTA	|
|RNF	|**Métricas Performance**		|	Documentar métricas iniciais de performance			|	MÉDIA	|
|RNF	|**Estrutura JSON**			|	Documentar estrutura do JSON enviado ao backend			|	MÉDIA	|
|RNF	|**Aprendizados e Melhorias**	|	Registrar aprendizados e melhorias futuras			|	MÉDIA	|
|RNF	|**Relatório Final Sprint** 	|		Entregar relatório final (vídeo + documentação)		|	ALTA	|

  </div>
</div>

<br>

##### [🔝 Voltar ao topo ](#topo)


<div>
<h2>
Requisitos do Cliente :
</h2>

 <h3> Requisitos funcionais :</h3>
  <p>
    RF01 –  O sistema deve detectar automaticamente eventos classificados como queda, com base em dados de movimento;
  </p> 
  <p>
    RF02 – O sistema deve enviar os dados de detecção via Wi-Fi para um aplicativo mobile de monitoramento;
  </p>
  <p>
      RF03 – O sistema deve permitir o cadastro de um número de telefone para recebimento de alertas por SMS;
  </p>
  <p>
    RF04 – O sistema deve enviar alertas por SMS automaticamente quando uma queda for detectada;
  </p>
  <p>
     RF05 – O aplicativo mobile deve exibir o status de monitoramento em tempo real. 
  </p>
   
  
<h3>Requisitos não funcionais :</h3>

<p>RNF01 – O sistema deve garantir baixa latência na transmissão de dados entre o dispositivo IoT e o backend;</p>
<p>RNF02 – O aplicativo mobile deve possuir interface intuitiva e acessível, adequada ao perfil do usuário idoso ou familiar;</p>
<p>RNF03 – A solução deve utilizar tecnologias de containerização (Docker) e pipeline de CI/CD;</p>
</div>

<br>

##### [🔝 Voltar ao topo ](#topo)


<div>
<h2>
Tecnologias :
<span id="tecnologias">
</h2>
</div>


<div>

<br>
<!-- TypeScript -->
<a href="https://www.typescriptlang.org/" target="_blank">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-plain.svg" alt="TypeScript" width="30" height="30">
</a>

<!-- MongoDB -->
<a href="https://www.mongodb.com/" target="_blank">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" alt="MongoDB" width="30" height="30">
</a>

<!-- React -->
<a href="https://react.dev/" target="_blank">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" width="30" height="30">
</a>

<!-- Figma -->
<a href="https://www.figma.com/" target="_blank">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" alt="Figma" width="30" height="30">
</a>

<!-- Node.js -->
<a href="https://nodejs.org/" target="_blank">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node.js" width="30" height="30">
</a>

<!-- Trello -->
<a href="https://trello.com/" target="_blank">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/trello/trello-plain.svg" alt="Trello" width="30" height="30">
</a>

<!-- VS Code -->
<a href="https://code.visualstudio.com/" target="_blank">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" alt="VS Code" width="30" height="30">
</a>

<!-- Docker -->
<a href="https://www.docker.com/" target="_blank"> 
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-plain.svg" alt="Docker" width="30" height="30"> 
</a>
</div>

<br>

##### [🔝 Voltar ao topo ](#topo)

<div>
<h2>
<span id="equipe">  
Nossa Equipe :
</h2>

<div>

| Função          | Nome                          | Links                                                                                                                         |
|-----------------|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| Project Owner   | Edlaine De Paula Souza | <a href="https://github.com/edlaine-souza">Github</a>|
| Scrum Master    | Bruno Henrique Menezes Ramos | <a href="">Github</a> |
| Dev Team        | Tiago Santini Da Silva     | <a href="https://github.com/TiagoSan77">Github</a>|
| Dev Team        | Luana Pinheiro dos Santos Ve | <a href="">Github</a>|
| Dev Team        | Vinicius Barbosa Fernandes    | <a href="">Github</a>|
| Dev Team        | Rodrigo De Andrade Paula |<a href="">Github</a> |

</div>

</div>
