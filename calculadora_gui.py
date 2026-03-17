import tkinter as tk

# Função que faz o cálculo
def calcular():
    try:
        n1 = float(entrada1.get())
        n2 = float(entrada2.get())
        op = operacao.get()

        if op == "+":
            resultado.set(n1 + n2)
        elif op == "-":
            resultado.set(n1 - n2)
        elif op == "*":
            resultado.set(n1 * n2)
        elif op == "/":
            resultado.set(n1 / n2)
        else:
            resultado.set("Erro")

    except:
        resultado.set("Inválido")

# Criando janela
janela = tk.Tk()
janela.title("Mini Calculadora")
janela.geometry("300x250")

# Entradas
entrada1 = tk.Entry(janela)
entrada1.pack(pady=5)

entrada2 = tk.Entry(janela)
entrada2.pack(pady=5)

# Operação
operacao = tk.StringVar()
operacao.set("+")

menu = tk.OptionMenu(janela, operacao, "+", "-", "*", "/")
menu.pack(pady=5)

# Resultado
resultado = tk.StringVar()
resultado.set("Resultado aparecerá aqui")

tk.Label(janela, textvariable=resultado).pack(pady=10)

# Botão
tk.Button(janela, text="Calcular", command=calcular).pack(pady=10)

janela.mainloop()
