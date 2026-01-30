## Configuração do Ambiente (MySQL Local)

# Siga os passos abaixo para preparar o banco de dados no Linux (Ubuntu):
- sudo apt update
- sudo apt install mysql-server
- sudo mysql
- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Senha@Forte2026';
- FLUSH PRIVILEGES;
- CREATE DATABASE gerenciador;
- SHOW DATABASES;
- exit;