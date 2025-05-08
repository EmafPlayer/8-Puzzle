from flask import Flask
from flask_cors import CORS
import random
from flask import request

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"]) 

@app.route("/puzzle/<int:modo>", methods=['GET', 'POST']) # Adicione POST aos métodos permitidos
def puzzle(modo):

    OBJETIVO_FINAL = [[0, 1, 2], [3, 4, 5], [6, 7, 8]]

    def encontrar_posicao_do_zero(tabuleiro):

        for indice_linha, linha in enumerate(tabuleiro):
            for indice_coluna, valor_peca in enumerate(linha):
                if valor_peca == 0:
                    return indice_linha, indice_coluna

        return -1, -1


    def calcular_numero_de_inversoes(estado_lista_unica):

        numero_de_inversoes = 0

        estado_lista_unica_sem_zero = []
        for peca in estado_lista_unica:
            if peca != 0:
                estado_lista_unica_sem_zero.append(peca)

        tamanho_lista = len(estado_lista_unica_sem_zero)

        for i in range(tamanho_lista):
            for j in range(i + 1, tamanho_lista):
                if estado_lista_unica_sem_zero[i] > estado_lista_unica_sem_zero[j]:
                    numero_de_inversoes += 1

        return numero_de_inversoes


    def verificar_se_estado_e_solucionavel(estado_lista_unica):

        numero_de_inversoes = calcular_numero_de_inversoes(estado_lista_unica)
        return numero_de_inversoes % 2 == 0


    def gerar_estado_inicial_aleatorio_solucionavel():

        lista_numeros_pecas = list(range(9))

        while True:

            random.shuffle(lista_numeros_pecas)

            if verificar_se_estado_e_solucionavel(lista_numeros_pecas):
                tabuleiro_inicial = []

                for i in range(0, 9, 3):
                    tabuleiro_inicial.append(lista_numeros_pecas[i:i + 3])

                if tabuleiro_inicial != OBJETIVO_FINAL:
                    return tabuleiro_inicial


    def calcular_distancia_manhattan(tabuleiro_atual):

        distancia_total_manhattan = 0

        for indice_linha_atual, linha_atual in enumerate(tabuleiro_atual):
            for indice_coluna_atual, valor_peca in enumerate(linha_atual):
                if valor_peca != 0:
                    linha_objetivo, coluna_objetivo = -1, -1
                    for indice_linha_obj, linha_obj in enumerate(OBJETIVO_FINAL):
                        if valor_peca in linha_obj:
                            linha_objetivo = indice_linha_obj
                            coluna_objetivo = linha_obj.index(valor_peca)
                            break
                    distancia_total_manhattan += abs(indice_linha_atual - linha_objetivo) + abs(
                        indice_coluna_atual - coluna_objetivo)

        return distancia_total_manhattan


    def gerar_estados_sucessores(tabuleiro_atual):

        lista_estados_sucessores = []
        linha_zero, coluna_zero = encontrar_posicao_do_zero(tabuleiro_atual)

        possiveis_movimentos_zero = [(0, 1), (0, -1), (1, 0), (-1, 0)]

        for delta_linha, delta_coluna in possiveis_movimentos_zero:

            nova_linha_zero = linha_zero + delta_linha
            nova_coluna_zero = coluna_zero + delta_coluna

            if 0 <= nova_linha_zero < 3 and 0 <= nova_coluna_zero < 3:

                novo_tabuleiro_sucessor = [list(linha) for linha in tabuleiro_atual]

                temp = novo_tabuleiro_sucessor[linha_zero][coluna_zero]
                novo_tabuleiro_sucessor[linha_zero][coluna_zero] = novo_tabuleiro_sucessor[nova_linha_zero][nova_coluna_zero]
                novo_tabuleiro_sucessor[nova_linha_zero][nova_coluna_zero] = temp

                lista_estados_sucessores.append(novo_tabuleiro_sucessor)

        return lista_estados_sucessores


    def imprimir_tabuleiro(tabuleiro):

        print("+---+---+---+")
        for linha in tabuleiro:
            print("|", end="")
            for num in linha:
                valor = " " if num == 0 else str(num)
                print(f" {valor} |", end="")
            print()
            print("+---+---+---+")


    def executar_busca_gulosa_heuristica_manhattan(tabuleiro_inicial):

        fila_de_estados_abertos = []
        fila_de_estados_abertos.append(
            (calcular_distancia_manhattan(tabuleiro_inicial), tabuleiro_inicial, [tabuleiro_inicial])
        )

        conjunto_estados_explorados_tuplas = set()
        numero_maximo_iteracoes = 2000
        contador_iteracoes_atuais = 0

        while fila_de_estados_abertos and contador_iteracoes_atuais < numero_maximo_iteracoes:
            contador_iteracoes_atuais += 1

            fila_de_estados_abertos.sort(key=lambda x: x[0])
            _, tabuleiro_atual, caminho_percorrido = fila_de_estados_abertos.pop(0)

            tabuleiro_tupla = tuple(tuple(linha) for linha in tabuleiro_atual)
            if tabuleiro_tupla in conjunto_estados_explorados_tuplas:
                continue
            conjunto_estados_explorados_tuplas.add(tabuleiro_tupla)

            if tabuleiro_atual == OBJETIVO_FINAL:
                print("Solução encontrada!")
                print(f"Número de passos: {len(caminho_percorrido) - 1}")
                print("Percurso:")
                for i, passo in enumerate(caminho_percorrido):
                    print(f"\nPasso {i}:")
                    imprimir_tabuleiro(passo)
                return caminho_percorrido

            for sucessor in gerar_estados_sucessores(tabuleiro_atual):
                sucessor_tupla = tuple(tuple(linha) for linha in sucessor)
                if sucessor_tupla not in conjunto_estados_explorados_tuplas:
                    heuristica = calcular_distancia_manhattan(sucessor)
                    novo_caminho = list(caminho_percorrido)
                    novo_caminho.append(sucessor)
                    fila_de_estados_abertos.append((heuristica, sucessor, novo_caminho))

        print(f"Solução não encontrada após {numero_maximo_iteracoes} iterações. O tabuleiro inicial era:")
        imprimir_tabuleiro(tabuleiro_inicial)
        print("O tabuleiro final (objetivo) é:")
        imprimir_tabuleiro(OBJETIVO_FINAL)
        return None


    # MAIN

    if request.method == 'POST':

        if modo == 1:

            data = request.get_json()
            novo_estado_inicial = data.get("estado", [])

            if verificar_se_estado_e_solucionavel(novo_estado_inicial):
                estado_inicial = []
                for i in range(0, 9, 3):
                    estado_inicial.append(novo_estado_inicial[i:i + 3])
            else:
                return {"status": 400, "message": "Não foi possível solucionar esse Puzzle"}
            
    elif request.method == 'GET':

        if modo == 0:

            estado_inicial = gerar_estado_inicial_aleatorio_solucionavel()
            print("Tabuleiro Inicial Gerado Aleatoriamente:")
            imprimir_tabuleiro(estado_inicial)

        else:
             return {"status": 400, "message": "Para enviar um estado específico, use o método POST com corpo JSON."}

    print("Tabuleiro Final (Objetivo):")
    imprimir_tabuleiro(OBJETIVO_FINAL)
    print("Iniciando Busca Gulosa com Heurística de Manhattan...")
    caminho_percorrido = executar_busca_gulosa_heuristica_manhattan(estado_inicial)
    return { "caminho": caminho_percorrido , "status": 200 }

if __name__ == "__main__":
    app.run(debug=True)