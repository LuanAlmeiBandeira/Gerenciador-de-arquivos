## Plano e Relatório de Testes - Gerenciador de PDFs
Este documento detalha os casos de teste realizados para garantir a funcionalidade, segurança e robustez do sistema, conforme os requisitos técnicos estabelecidos.

## 1. Metodologia
Foram realizados Testes de Integração para validar a comunicação completa entre o Frontend, a API e o Banco de Dados MySQL em ambiente local

## 2. Casos de Teste

## Módulo de Segurança e Autenticação
     
- TC-01: Cadastro de Usuário / Nome,CPF, Email, Senha /Usuário criado e senha armazenada com Hash (Bcrypt).

- TC-02: Login com credenciais / válidas Email e Senha corretos / Recebimento de Token JWT e redirecionamento à Home.

- TC-03: Login com senha incorreta / Email correto e Senha errada / Mensagem: "Usuário ou senha inválidos" (Erro 401).

- TC-04: Proteção de Rota / Acesso direto a (/) sem Token /Redirecionamento automático para /login.

## Módulo de Gerenciamento de Arquivos (CRUD)

- TC-05: Upload de PDF por CPF / Arquivo .pdf + CPF / Arquivo salvo em /public/uploads e registro no DB.

- TC-06: Busca de Arquivos por CPF / CPF do usuário / Lista de todos os PDFs vinculados àquele CPF.

- TC-07: Edição de Tipo (Update) / Novo tipo via Prompt / Alteração refletida instantaneamente na listagem.

- TC-08: Exclusão de Arquivo / Clique no botão Deletar / Remoção do registro no banco e atualização da UI.

## 3. Tratamento de Erros e Exceções

- O sistema foi testado contra entradas inválidas para garantir a estabilidade:

- Arquivos Não-PDF: O frontend limita a seleção para .pdf via atributo accept. No backend, o Multer valida o fluxo de dados.

- CPFs Inexistentes: Ao buscar um CPF não cadastrado, o sistema retorna erro 404 amigável: "Usuário não encontrado".

- Campos Vazios: Validamos que o sistema impede o envio de formulários de registro ou login com campos em branco utilizando o atributo required do HTML5.

## 4. Testes de Usabilidade e Responsividade

- Responsividade: A interface foi testada em resoluções de Desktop (1920x1080) e Mobile (360x800 - iPhone/Android), utilizando Flexbox e Media Queries para garantir a leitura.

- Navegação via Teclado: Verificado que todos os campos de input e botões são alcançáveis através da tecla Tab.

