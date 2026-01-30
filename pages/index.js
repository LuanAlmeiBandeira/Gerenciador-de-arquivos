"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
    const [token, setToken] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const router = useRouter();

    const [novoCpf, setNovoCpf] = useState("");
    const [cpfBusca, setCpfBusca] = useState("");
    const [resultado, setResultado] = useState(null);

    // Agora 'files' guardará objetos com { arquivo, tipoDoc }
    const [files, setFiles] = useState([]);
    const [tipo, setTipo] = useState("CPF");

    useEffect(() => {
        const tokenSalvo = localStorage.getItem("token");
        if (!tokenSalvo) {
            router.push("/login");
        } else {
            setToken(tokenSalvo);
            setCarregando(false);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    const handleBusca = async () => {
        if (!cpfBusca) return alert("Digite um CPF!");

        try {
            const res = await fetch(`/api/arquivos?cpf=${cpfBusca}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json();
                if (!res.ok) return alert(data.error || "Erro na busca.");
                setResultado(data);
            } else {
                alert("Erro interno no servidor ou CPF não encontrado.");
            }
        } catch (error) {
            alert("Não foi possível conectar ao servidor.");
        }
    };

    const gerarNomeAutomatico = (tipoDoc, cpfUsuario) => {
        const mapTipos = {
            "CPF": `cpf_${cpfUsuario}.pdf`,
            "RG/CIN": `rg_${cpfUsuario}.pdf`,
            "Comprovante Escolar-Histórico": `historico_${cpfUsuario}.pdf`,
            "Certidão de Nascimento": `certidao_${cpfUsuario}.pdf`,
            "Comprovante de Residência": `residencia_${cpfUsuario}.pdf`,
        };
        return mapTipos[tipoDoc] || `documento_${cpfUsuario}.pdf`;
    };

    // FUNÇÃO PARA ADICIONAR AO "CARRINHO" DE UPLOADS
    const handleFileSelection = (e) => {
        const selecionados = Array.from(e.target.files);
        const novosArquivos = selecionados.map(f => ({
            arquivo: f,
            tipoDoc: tipo // Vincula o tipo que está selecionado no <select> no momento
        }));

        setFiles([...files, ...novosArquivos]);
        // Opcional: resetar o input para permitir selecionar o mesmo arquivo se necessário
        e.target.value = null;
    };

    const handleCadastrarPdf = async () => {
        if (!novoCpf || files.length === 0) {
            return alert("Digite o CPF e selecione os arquivos primeiro!");
        }

        let sucessos = 0;

        for (const item of files) {
            const formData = new FormData();
            formData.append("cpf", novoCpf);
            formData.append("tipo_documento", item.tipoDoc);
            formData.append("novo_nome_automatico", gerarNomeAutomatico(item.tipoDoc, novoCpf));
            formData.append("file", item.arquivo);

            try {
                const res = await fetch("/api/arquivos", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                });
                if (res.ok) sucessos++;
            } catch (err) {
                console.error("Erro no upload:", err);
            }
        }

        alert(`${sucessos} documento(s) enviados com sucesso!`);
        setFiles([]);
        setNovoCpf("");
        handleBusca();
    };

    const handleDeletar = async (id) => {
        if (!confirm("Tem certeza que deseja deletar este arquivo?")) return;
        const res = await fetch(`/api/arquivos/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status !== 204) return alert("Erro ao deletar");
        handleBusca();
    };

    const handleUpdate = async (id) => {
        const novoTipo = prompt("Digite o novo tipo do documento:");
        if (!novoTipo) return;
        const res = await fetch(`/api/arquivos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ tipo_documento: novoTipo })
        });
        if (res.ok) { alert("Tipo atualizado!"); handleBusca(); }
    };

    if (carregando) return <p>Carregando...</p>;

    return (
        <div className="container">
            <header>
                <h1>📄 Gerenciador de Arquivos</h1>
                <p>Acumule os documentos e envie todos de uma vez</p>
                <button onClick={handleLogout} className="btn-logout">Sair</button>
            </header>

            <main>
                <section className="buscar">
                    <input
                        id="busca-cpf"
                        placeholder="Digite o CPF para buscar"
                        value={cpfBusca}
                        onChange={(e) => setCpfBusca(e.target.value)}
                    />
                    {/* Adicione a classe aqui */}
                    <button onClick={handleBusca} className="btn-busca">Buscar Documentos</button>
                </section>

                <section className="novo-arquivo">
                    <h3>1. Configure o Titular e o Tipo</h3>
                    <div className="form-group">
                        <input
                            placeholder="CPF do titular"
                            value={novoCpf}
                            onChange={(e) => setNovoCpf(e.target.value)}
                        />

                        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                            <option>CPF</option>
                            <option>RG/CIN</option>
                            <option>Comprovante Escolar-Histórico</option>
                            <option>Certidão de Nascimento</option>
                            <option>Comprovante de Residência</option>
                        </select>

                        <input
                            type="file"
                            id="file-upload"
                            accept=".pdf"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleFileSelection}
                        />
                        <button
                            type="button"
                            className="btn-select"
                            onClick={() => document.getElementById('file-upload').click()}
                        >
                            ➕ Adicionar à Lista
                        </button>
                    </div>

                    {files.length > 0 && (
                        <div className="file-list">
                            <strong>Arquivos na fila para envio:</strong>
                            <ul>
                                {files.map((f, i) => (
                                    <li key={i}>
                                        <span className="badge">{f.tipoDoc}</span> {f.arquivo.name}
                                        <button onClick={() => setFiles(files.filter((_, index) => index !== i))} className="btn-remove">x</button>
                                    </li>
                                ))}
                            </ul>
                            <button onClick={handleCadastrarPdf} className="btn-success">
                                🚀 Enviar Todos Agora ({files.length})
                            </button>
                        </div>
                    )}
                </section>

                {resultado && (
                    <section className="lista">
                        <h2>Usuário: {resultado.usuario.cpf}</h2>
                        <div className="arquivos-grid">
                            {resultado.arquivos.map((a) => (
                                <div className="card" key={a.id}>
                                    <div className="arquivo-info">
                                        <strong>{a.tipo_documento}:</strong>
                                        <a href={a.caminho_arquivo} target="_blank" rel="noopener noreferrer">{a.nome_armazenado}</a>
                                    </div>
                                    <div className="arquivo-actions">
                                        <button onClick={() => handleUpdate(a.id)} className="btn-edit">Editar</button>
                                        <button onClick={() => handleDeletar(a.id)} className="btn-delete">Deletar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <style jsx>{`
                .container { font-family: sans-serif; background: #f4f4f9; min-height: 100vh; padding: 40px; }
                header { text-align: center; margin-bottom: 40px; }
                .buscar, .novo-arquivo { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; }
                input, select { padding: 10px; border-radius: 5px; border: 1px solid #ccc; margin: 5px; }
                button { padding: 10px 20px; border-radius: 5px; color: white; border: none; cursor: pointer; font-weight: bold; margin: 5px; }
                .btn-select { background: #6c757d; }
                .btn-success { background: #28a745; width: 100%; margin-top: 15px; font-size: 1.1rem; }
                .btn-logout { background: #999; }
                .btn-edit { background: #ffc107; color: #333; }
                .btn-delete { background: #d7263d; }
                .btn-remove { background: none; color: red; border: none; cursor: pointer; font-size: 1rem; padding: 0 5px; }
                .file-list { margin-top: 20px; text-align: left; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px dashed #ccc; }
                .file-list ul { list-style: none; padding: 0; }
                .file-list li { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid #eee; }
                .badge { background: #4a4a8c; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; margin-right: 10px; text-transform: uppercase; }
                .arquivos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
                .card { background: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .btn-busca {
                background: #f6f7f8ff; /* Cor azul (exemplo) */
                color: black;
                }

                .btn-busca:hover {
                background: #e8ebf0ff; /* Cor um pouco mais escura ao passar o mouse */
                }
            `}</style>
        </div>
    );
}