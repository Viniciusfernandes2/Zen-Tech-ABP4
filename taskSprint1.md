# Sistema de Detecção de Quedas – Controle de Tasks

Use esta tabela para acompanhar todas as tasks do projeto. Marque ⬜ para pendente e ✅ quando concluída.

## Sprint 1 – IoT e Detecção Local

| ID       | Descrição                                                                                      | Autor               | Data     | Status  |
|----------|------------------------------------------------------------------------------------------------|-------------------|----------|---------|
| EU 001   | Criação do wireframe do Aplicativo.                                              | Luana Pinheiro     | 18/09    | ✅      |
| LD 002   | Criação do repositorio do Github e criação do repositorio para as tasks          | Vinicius Barbosa   | 18/09    | ✅      |
| PD 003   | Criação das páginas de Home, Iniício, Cadastro, e Menu do app.                   | Rodrigo de Andrade | 18/09    | ✅      |
| EU 004   | Feito requisito da matéria solicitada pelo professor( Jornada do Usuário )       | Edlaine Paula      | 18/09    | ✅      |
| IC 005   | Criação de novas Tasks                                                           | Bruno Menezes      | 22/09    | ✅      |
| PD 006   | Implementação do banco de dados não relacional MongoDB em ambiente de nuvem.     | Tiago Santini      | 22/09    | ✅      |
| PD 007   | Criação da página de Configuração de Emergência                                  | Rodrigo de Andrade | 22/09    | ✅      |
| EU 008   | Desenvolvimento da Logo                                                          | Luana Pinheiro     | 22/09    | ✅      |
| IC 009   | Atualizando a página do Readme do Github.                                        | Edlaine Paula      | 22/09    | ✅      |
| IT 010   | Levantamento dos requisitos e elaboração das tasks das 3 Sprints (mutavel)       | Bruno Menezes      | 24/09    | ✅      |
| IT 011   | Backlog Priorizado por Sprints                                                   | Edlaine Paula      | 24/09    | ⬜      |
| IT 012   | Levantamento de Pontos Positivos e Negativos Acelerometro MPU6050 para compra    |                    |          | ⬜      |
| IT 013   | Modelagem do Banco de Dados (UML)                                                |                    |          | ⬜      |
| IT 014   | Levantamento de Pontos Positivos e Negativos Acelerometro MPU9250 para compra    |                    |          | ⬜      |
|          | Montar circuito ESP32 + acelerômetro                                             |                    |          | ⬜      |
|          | Testar alimentação do sensor via 3.3V                                            |                    |          | ⬜      |
|          | Verificar comunicação I2C entre ESP32 e sensor                                   |                    |          | ⬜      |
|          | Ajustar endereçamento I2C do sensor                                              |                    |          | ⬜      |
|          | Validar leitura de dados crus do acelerômetro                                    |                    |          | ⬜      |
|          | Validar leitura de dados crus do giroscópio                                      |                    |          | ⬜      |
|          | Documentar esquema elétrico                                                      |                    |          | ⬜      |
|          | Configurar ambiente de desenvolvimento (Arduino IDE/PlatformIO)                  |                    |          | ⬜      |
|          | Criar sketch base para o ESP32                                                   |                    |          | ⬜      |
|          | Importar biblioteca do sensor                                                    |                    |          | ⬜      |
|          | Implementar rotina de leitura dos eixos ax, ay, az                               |                    |          | ⬜      |
|          | Implementar rotina de leitura dos giros gx, gy, gz                               |                    |          | ⬜      |
|          | Normalizar valores lidos (g’s e °/s)                                             |                    |          | ⬜      |
|          | Calibrar acelerômetro                                                            |                    |          | ⬜      |
|          | Calibrar giroscópio                                                              |                    |          | ⬜      |
|          | Criar log serial para debug dos dados                                            |                    |          | ⬜      |
|          | Gravar vídeo de teste de movimento para validação                                |                    |          | ⬜      |
|          | Implementar cálculo da magnitude da aceleração                                   |                    |          | ⬜      |
|          | Definir thresholds iniciais para detecção de queda                               |                    |          | ⬜      |
|          | Criar função para identificar pico de aceleração                                 |                    |          | ⬜      |
|          | Implementar detecção de ausência de movimento pós-pico                           |                    |          | ⬜      |
|          | Combinar regras simples para classificar queda                                   |                    |          | ⬜      |
|          | Testar diferentes thresholds (2.5g, 3g, 3.5g)                                    |                    |          | ⬜      |
|          | Validar com simulação de movimentos normais (andar, sentar)                      |                    |          | ⬜      |
|          | Documentar os resultados da calibração                                           |                    |          | ⬜      |
|          | Configurar conexão do ESP32 com rede Wi-Fi local                                 |                    |          | ⬜      |
|          | Implementar rotina de reconexão automática                                       |                    |          | ⬜      |
|          | Criar envio básico via HTTP POST para servidor de testes                         |                    |          | ⬜      |
|          | Criar payload JSON com dados do evento                                           |                    |          | ⬜      |
|          | Validar envio em tempo real (Serial + servidor)                                  |                    |          | ⬜      |
|          | Documentar endpoint usado para envio                                             |                    |          | ⬜      |
|          | Simular quedas reais (deixar objeto cair junto com sensor)                       |                    |          | ⬜      |
|          | Coletar dados de diferentes cenários (queda vs movimento normal)                 |                    |          | ⬜      |
|          | Validar taxa de falsos positivos                                                 |                    |          | ⬜      |
|          | Validar taxa de falsos negativos                                                 |                    |          | ⬜      |
|          | Testar estabilidade da conexão Wi-Fi (tempo ligado > 1h)                         |                    |          | ⬜      |
|          | Documentar métricas iniciais de performance                                      |                    |          | ⬜      |
|          | Documentar estrutura do JSON enviado ao backend                                  |                    |          | ⬜      |
|          | Registrar aprendizados e melhorias futuras                                       |                    |          | ⬜      |
|          | Entregar relatório final da Sprint 1 (vídeo + documentação)                      |                    |          | ⬜      | 
