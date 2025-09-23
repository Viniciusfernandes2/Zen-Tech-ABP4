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
 
 [Jornada do usuário ](./EU-02-PersonaEJornadaDoUsuário-Modelo.pdf)



<br>

##### [🔝 Voltar ao topo ](#topo)

<h2 id="sprint">
Entregas de Sprints e Tasks :
</h2>

Todas as entregas serão realizadas conforme os prazos acordados com o cliente. Para cada ciclo de desenvolvimento, será gerado um relatório completo por sprint e uma planilha de tarefas, na aba Tasks, que detalha cada atividade executada, o responsável, a data de conclusão e uma descrição do trabalho realizado. A relação detalhada das sprints e tarefas é apresentada abaixo.

<div align="center">

| Sprint | Previsão de Entrega | Status | Relatório | Tasks |
| ------ | -------------------- | ------ | --------- |-------|
|   1    | 📅 07/10/2025        | :construction:| [:round_pushpin: Ver Relatório](./Sprint01.md) |[:round_pushpin: Ver Relatório](./taskSprint1.md) |
|   2    | 📅 04/11/2025        | [-]| [:round_pushpin: Ver Relatório]() | [:round_pushpin: Ver Relatório]()|
|   3    | 📅 25/11/2025        | [-]| [:round_pushpin: Ver Relatório]() | [:round_pushpin: Ver Relatório]()|

</div>

Legenda:
- :white_check_mark: **Finalizada**
- :construction: **Em Progresso**
- [-] **Não iniciado**

A apresentação da Sprint 1 em vídeo por ser acessada por [aqui!]() 

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
|  | **WireFrame do projeto**           | Criar estrutura basica do projeto | ALTA
| RP01| **Protótipo (Figma)**              | Criar protótipo das principais telas (Login, Cadastro, Home e Gráficos).                     | ALTA       |
| RF01 | **Tela de Login**                  | Desenvolver tela de login e integrá-la com o back-end para autenticação.                     | ALTA       |
| RF01 | **Tela de Cadastro**               | Criar tela para cadastro de usuários com validação e integração com o back-end.              | ALTA       |
| RP02 | **Back-end – Autenticação**        | Implementar API de autenticação com Node.js, usando MongoDB e segurança (JWT).               | ALTA       |
|  | **Home Page – Front-end**          | Desenvolver home page com navegação para as outras funcionalidades.                        | MÉDIA      |
| RNF03 | **Página Explicativa**                      | Criar uma página com a explicação do projeto e seus objetivos.   | MÉDIA      |
| RNF01 | **Tela de Gráficos e Estatísticas**| Exibir dados meteorológicos em gráficos interativos.                | MÉDIA      |
| RP02 | **Infraestrutura Front-end**       | Configurar projeto React TypeScript, rotas e estrutura de componentes.                       | MÉDIA      |
| RP02 | **Documentação no Github**       | Criar documentação do projeto com grafico bundown e backlog                       | MÉDIA      |
| RNF02 | **Validação Responsiva**           | Garantir que as telas tenham layout responsivo em diferentes dispositivos.                   | BAIXA      |
| RF02 | **Histórico de Dados (Tabular)**            | Exibir registros históricos de cada estação em forma de tabela. | ALTA       |
| RF03 | **Gráficos de Parâmetros**                  | Mostrar gráficos interativos dos parâmetros de uma estação.    | ALTA       |
| RF04 | **Gráficos Comparativos**                   | Comparar o mesmo parâmetro entre diferentes estações.          | MÉDIA      |
| RF05 | **Download de Dados (CSV)**                 | Permitir a exportação dos dados em formato CSV.                | ALTA       |
|  | **Sistema de Alertas e Notícias**           | Implementar lógica de alertas e exibi-los na home page (agora painel de notícias).  | ALTA       |
|  | **Refinamento e Integração Final**          | Ajustar integrações entre front-end e back-end e corrigir bugs.    | MÉDIA      |
| RP02| **Documentação Final**                      | Consolidar a documentação do projeto.     | MÉDIA      |
|  | **Integrar Chatbot**                       | Integrar Chatbot para geração de alertas  | ALTA       |

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
