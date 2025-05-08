import { useRef, useState } from "react"
import axios from "axios";
import { Peca } from "./components/peca";
import { Botao } from "./components/botao";
import { toast, ToastContainer } from "react-toastify";
import { twMerge } from "tailwind-merge";

export function Puzzle () {
    
    const [botao_aleatorio, setBotaoAleatorio] = useState(false)
    const [botao_solucionar, setBotaoSolucionar] = useState(false)
    const [botao_criar, setBotaoCriar] = useState(false)
    const [botao_enviar, setBotaoEnviar] = useState(false)

    const intervaloRef = useRef<number | null>(null);
    
    const [contador, setContador] = useState(0);
    
    const [opcoes, setOpcoes] = useState<number[]>([0,1,2,3,4,5,6,7,8])
    
    const [caminhos, setCaminhos] = useState<number[][][]>([
        [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8]
        ]
    ]);
    
    const [status_botao, setStatusBotao] = useState<boolean[][]>(
        [
            [false, false, false],
            [false, false, false],
            [false, false, false]
        ]
    );

    function botaoEmbaralhar () {

        if (intervaloRef.current !== null) {
            clearInterval(intervaloRef.current);
        }

        setBotaoEnviar(false)
        setBotaoAleatorio(true)
        setBotaoSolucionar(false)
        setBotaoCriar(false)
        resetarOpcoes()
        resetarStatus()

    }

    function botaoCriar () {

        if (intervaloRef.current !== null) {
            clearInterval(intervaloRef.current);
        }

        setBotaoEnviar(false)
        setBotaoAleatorio(false)
        setBotaoSolucionar(false)
        setBotaoCriar(true)
        resetarOpcoes()
        resetarStatus()

    }

    function resetarOpcoes () {
        setOpcoes([0,1,2,3,4,5,6,7,8]);
    }

    function resetarStatus () {
        setStatusBotao([
            [false, false, false],
            [false, false, false],
            [false, false, false]
        ]);
    }

    function criarPuzzle () {

        setContador(0)

        setCaminhos([
            [
                [-1, -1, -1],
                [-1, -1, -1],
                [-1, -1, -1]
            ]
        ])

    }

    const resolverPuzzle = () => {

        if (intervaloRef.current) clearInterval(intervaloRef.current);
    
        intervaloRef.current = setInterval(() => {
            setContador(prev => {
                if (caminhos.length === 0) return prev;
    
                if (prev < caminhos.length - 1) {
                    return prev + 1;
                } else {
                    if (intervaloRef.current) clearInterval(intervaloRef.current);
                    return prev;
                }
            });
        }, 700);

    };

    function modificarPeca(index1: number, index2: number, value: number) {

        const temp_estado = caminhos[0].map(row => [...row]);
        temp_estado[index1][index2] = opcoes[value];
        setCaminhos([temp_estado]);

        setOpcoes(opcoes.filter((_,i) => i != value))

    }

    function modificarStatusBotao(index1: number, index2: number) {

        const temp_status = status_botao.map(row => [...row]);
        temp_status[index1][index2] = !temp_status[index1][index2];
        setStatusBotao(temp_status);

    }

    const embaralhar = async () => {

        const caminhos_temp_aleatorio = await axios.get('http://localhost:5000/puzzle/0');
        setCaminhos(caminhos_temp_aleatorio.data.caminho)

        setContador(0)

    };

    const enviarGerado = async () => {

        const matrizAtual = caminhos[0];
        const todosNumeros = matrizAtual.flat();
    
        if (!todosNumeros.includes(-1)) {
    
            try {
                
                const response = await axios.post("http://localhost:5000/puzzle/1", 
                    { estado: todosNumeros },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                ) ;
    
                console.log("Resposta do backend:", response.data);
                
                if(response.data.status === 400) {
                    toast.error("Puzzle precisa ter o número de inversões par", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                    return;
                }
                
                setCaminhos(response.data.caminho);
                setBotaoEnviar(true);
    
                toast.success("Puzzle enviado com sucesso", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
    
            } catch (error) {
                console.error("Erro na requisição:", error);
                toast.error("Erro ao enviar puzzle", {
                    position: "top-right",
                });
            }
            
        } else {
            toast.error("Puzzle precisa ser todo preenchido", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    };

    return (
        <div>
            <main className="h-screen w-full flex flex-col items-center justify-center bg-sky-700 gap-y-12">
                <h1 className="text-[2.4rem] font-medium text-white">{contador + 1}º Passo</h1>
                
                <div className="">
                    
                    <div className="grid grid-cols-3 gap-7 bg-slate-200 p-12 shadow-2xl">
                        {caminhos.length != 0 && caminhos[contador][0].map((caminho, index0) =>
                            <div className="">
                                <Peca onClick={caminho === -1 ? () => {modificarStatusBotao(0, index0)} : undefined}>{caminho}</Peca>
                                {status_botao[0][index0] && 
                                    <ul className="absolute translate-y-[0.5rem]">
                                        {opcoes.map((status, value) => 
                                            <li><button onClick={(e) => {e.preventDefault(); modificarPeca(0, index0, value); modificarStatusBotao(0,index0)}} className="w-[10rem] h-11 text-[16px] font-normal rounded-md text-slate-100 hover:text-[#ffffff] bg-[#A68446] hover:bg-[#402515] active:border-2 mb-1">{status}</button></li>
                                        )}
                                    </ul>}
                            </div>                        
                        )}
                        {caminhos.length != 0 && caminhos[contador][1].map((caminho, index1) =>
                            <div>
                                <Peca onClick={caminho === -1 ? () => {modificarStatusBotao(1, index1)} : undefined}>{caminho}</Peca>
                                {status_botao[1][index1] && 
                                    <ul className="absolute translate-y-[0.5rem]">
                                        {opcoes.map((status, value) => 
                                            <li><button onClick={(e) => {e.preventDefault(); modificarPeca(1, index1, value); modificarStatusBotao(1,index1)}} className="w-[10rem] h-11 text-[16px] font-normal rounded-md text-slate-100 hover:text-[#ffffff] bg-[#A68446] hover:bg-[#402515] active:border-2 mb-1">{status}</button></li>
                                        )}
                                    </ul>}
                            </div> 
                        )}
                        {caminhos.length != 0 && caminhos[contador][2].map((caminho, index2) =>
                            <div>
                                <Peca onClick={caminho === -1 ? () => {modificarStatusBotao(2, index2)} : undefined}>{caminho}</Peca>
                                {status_botao[2][index2] && 
                                    <ul className="absolute translate-y-[1rem]">
                                        {opcoes.map((status, value) => 
                                            <li><button onClick={(e) => {e.preventDefault(); modificarPeca(2, index2, value); modificarStatusBotao(2,index2)}} className="w-[10rem] h-11 text-[16px] font-normal rounded-md text-slate-100 hover:text-[#ffffff] bg-[#A68446] hover:bg-[#402515] active:border-2 mb-1">{status}</button></li>
                                        )}
                                    </ul>}
                            </div> 
                        )}
                    </div>

                </div>

                <ul className="flex gap-x-8">
                    <li><Botao onClick={() => {resolverPuzzle()}} className={twMerge("bg-yellow-400 text-black", (!botao_enviar && botao_criar) && "pointer-events-none opacity-30")}>Solucionar</Botao></li>
                    <li><Botao onClick={() => {embaralhar(); botaoEmbaralhar()}} className="bg-purple-900 text-white">Aleatório</Botao></li>
                    <li><Botao onClick={() => {criarPuzzle(); botaoCriar()}} className={twMerge("bg-red-800 text-white")}>Criar Manualmente</Botao></li>
                    {botao_criar && <li><Botao onClick={() => {enviarGerado()}} className="bg-green-700 text-white">Enviar</Botao></li>}
                </ul>
            </main>
            <ToastContainer />
        </div>
    )

}