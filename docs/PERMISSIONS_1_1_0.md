# Matriz de permissões Community 1.1.0

Status: revisada tecnicamente; aplicação pendente de autorização explícita.

Esta matriz descreve capacidades que o código atual já tenta usar. Ela não concede acesso novo por si só. O objetivo é tornar o catálogo, o runtime e os clientes de bridge coerentes antes da publicação.

| Pack               | Permissões propostas                                    | Escopo declarado                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Calendar           | Nenhuma                                                 | Troca snapshots e comandos validados com um To-Do ativo por eventos do host.                                                                                                              |
| Clock              | net:fetch                                               | https://api.open-meteo.com                                                                                                                                                                |
| Launcher           | fs:scope; shell:exec; net:fetch                         | Filesystem e shell: qualquer atalho ou target configurado pelo usuário. Favicon: hosts públicos HTTP/HTTPS; o Rust bloqueia credenciais, loopback, redes privadas e destinos não HTTP(S). |
| LoL Player Stats   | store:read; store:write; net:fetch                      | Credencial/configuração do pack e https://\*.api.riotgames.com                                                                                                                            |
| PC Monitor         | system:specs; system:telemetry; store:read; store:write | Especificações e telemetria do computador; configuração dos widgets.                                                                                                                      |
| Productivity Suite | Nenhuma                                                 | Usa o protocolo de tarefas por eventos e não acessa o armazenamento nativo diretamente.                                                                                                   |
| To-Do              | store:read; store:write                                 | Arquivo de tarefas pertencente ao pack.                                                                                                                                                   |
| Weather            | net:fetch                                               | https://api.open-meteo.com                                                                                                                                                                |
| MapCN              | network:capture; store:read; store:write                | Captura de rede autorizada e configuração dos widgets.                                                                                                                                    |

## Limite atual de enforcement

O Core 1.1.0 exige consentimento por categoria de permissão. Os arrays allow de net:fetch, fs:scope e shell:exec são metadados visíveis e auditáveis, mas ainda não formam uma sandbox de paths, comandos ou origens. Packs instalados são extensões executáveis curadas no mesmo realm do host.

Por isso, o Launcher precisa declarar escopo amplo e explícito. Declarar apenas arquivos .lnk ou HTTPS seria incorreto: o código também valida/lê executáveis, bibliotecas e imagens, abre paths/URLs configurados com argumentos e aceita favicon HTTP para hosts públicos.

## Evidência

O verificador scripts/verify-built-packs.mjs importa ESM, CJS, declarações, manifestos e runtimes dos nove packs. Ele também lê os manifests de bridge do código fonte e traduz tauri:fs para fs:scope e tauri:shell para shell:exec. O gate atual enumera 18 omissões em sete packs; Calendar e Productivity Suite já estão sem acesso nativo direto.

Depois da autorização, o marco de validação deve incluir:

1. build dos nove packs;
2. 10 testes Calendar/To-Do;
3. verificador de artefatos sem violações;
4. duas gerações de ZIPs e catálogo com comparação byte a byte;
5. atualização do pin Community no repositório de integração.
