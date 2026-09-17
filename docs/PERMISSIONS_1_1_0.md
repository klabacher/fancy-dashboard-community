# Matriz de permissões Community 1.1.0

Status: autorizada, aplicada e validada no marco de 17 de setembro de 2026.

Esta matriz descreve capacidades que o código atual já tenta usar. Ela não concede acesso novo por si só. O objetivo é tornar o catálogo, o runtime e os clientes de bridge coerentes antes da publicação.

| Pack               | Permissões propostas                                                  | Escopo declarado                                                                                                                                                                          |
| ------------------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Calendar           | Nenhuma                                                               | Troca snapshots e comandos validados com um To-Do ativo por eventos do host.                                                                                                              |
| Clock              | net:fetch                                                             | https://api.open-meteo.com                                                                                                                                                                |
| Launcher           | fs:scope (`*`); shell:exec (`*`); net:fetch (`http://*`, `https://*`) | Filesystem e shell: qualquer atalho ou target configurado pelo usuário. Favicon: hosts públicos HTTP/HTTPS; o Rust bloqueia credenciais, loopback, redes privadas e destinos não HTTP(S). |
| LoL Player Stats   | store:read; store:write; net:fetch                                    | Credencial/configuração do pack e https://\*.api.riotgames.com                                                                                                                            |
| PC Monitor         | system:specs; system:telemetry; store:read; store:write               | Especificações e telemetria do computador; configuração dos widgets.                                                                                                                      |
| Productivity Suite | Nenhuma                                                               | Usa o protocolo de tarefas por eventos e não acessa o armazenamento nativo diretamente.                                                                                                   |
| To-Do              | store:read; store:write                                               | Arquivo de tarefas pertencente ao pack.                                                                                                                                                   |
| Weather            | net:fetch                                                             | https://api.open-meteo.com                                                                                                                                                                |
| MapCN              | network:capture; store:read; store:write                              | Captura de rede autorizada e configuração dos widgets.                                                                                                                                    |

## Limite atual de enforcement

O Core 1.1.0 exige consentimento por categoria de permissão. Os arrays allow de net:fetch, fs:scope e shell:exec são metadados visíveis e auditáveis, mas ainda não formam uma sandbox de paths, comandos ou origens. Packs instalados são extensões executáveis curadas no mesmo realm do host.

Por isso, o Launcher precisa declarar escopo amplo e explícito. Declarar apenas arquivos .lnk ou HTTPS seria incorreto: o código também valida/lê executáveis, bibliotecas e imagens, abre paths/URLs configurados com argumentos e aceita favicon HTTP para hosts públicos.

## Evidência

O verificador scripts/verify-built-packs.mjs importa ESM, CJS, declarações, manifestos e runtimes dos nove packs. Ele lê os manifests de bridge do código fonte, traduz tauri:fs para fs:scope e tauri:shell para shell:exec e exige igualdade exata com esta matriz, incluindo allowlists e ausência de capacidades extras. Calendar e Productivity Suite permanecem sem acesso nativo direto.

O marco integrado concluiu o build dos nove packs, os 10 testes Calendar/To-Do e o verificador de artefatos sem violações. Duas gerações independentes dos nove ZIPs, do catálogo e do bundle agregado foram byte a byte idênticas. O catálogo resultante tem SHA-256 `1a378950e0455cc9fbcd3a953d2f96a7c9debc2e45b96c87d5e1733741038546`; o bundle `FancyDashboard-Community-1.1.0.zip` tem SHA-256 `2870337ad67eac041a76cb0bd681897e06e983fad9678ae1ebcffa15f0002f82`.

Os hashes completos e os comandos do marco estão registrados em `docs/evidence/1.1.0/community-permission-artifact-report.json`. O repositório de integração deve fixar o commit que contém esta matriz antes do gate composto final.
