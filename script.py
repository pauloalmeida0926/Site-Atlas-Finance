print("hello wolrd!")
macas = 10
peras = 20
morangos = 56
total = (morangos + macas + peras)
print("total de frutas:", total)
numero1 = float(input("Digite o primeiro número: "))
operacao = input("Digite a operação (+, -, *, /): ")    
numero2 = float(input("Digite o segundo número: "))   
if operacao == "+":
    resultado= numero1 + numero2
elif operacao == "-":
    resultado = numero1 - numero2
elif operacao == "*":
    resultado = numero1 * numero2
elif operacao == "/":
    resultado = numero1 / numero2
else:
    print("Operacao inválida!")
    resultado = None
if resultado is not None:
    print("Resultado:", resultado)