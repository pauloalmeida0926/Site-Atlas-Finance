# #teste 1
# idade = 17
# if idade < 18:
#     print("menor de idade!")
# elif idade < 60:
#     print("adulto!")
# else: 
#     print("idoso")

# #teste 2
# numero = int(input("digite um numero: "))
# if numero < 0:
#     print("negativo!")
# elif numero == 0:
#     print("neutro")
# else:
#     print("posiitivo")

# #teste 3
# numero1 = int(input("digite um numero: "))
# numero2 = int(input("digite um numero:" ))
# if numero1 > numero2:
#     print("numero1 é maior")
# elif numero2 > numero1:
#     print("numero2 é maior")
# else:
#    print("os dois são iguais")

# #teste 4
# numero1 = int(input("digite um numero: "))
# numero2 = int(input("digite um numero: "))
# numero3 = int(input("digite um numero: "))
# if numero1 == numero2 == numero3:
#     print("todos os numeros são iguais")
# elif numero1 >= numero2 and numero1 >= numero3:
#     print("numero1 é maior")
# elif numero2 >= numero1 and numero2 >= numero3:
#     print("numero2 é maior")
# elif numero3 >= numero2 and numero3 >= numero1:
#     print("numero3 é maior")
# else:
#     print("numero3 é maior")

# #teste 5
# nota = int(input("digite a nota: "))
# if nota < 60:
#    mensagem = "Aluno reprovado!"
# elif nota > 60 and nota < 80:
#     mensagem = "Nota boa!"
# else:
#     mensagem = "Nota excelente! Parabéns"
# print(mensagem)

# while True:
#     nota = int(input("Digite a nota do aluno (-1 para sair): "))

#     if nota == -1:
#         break

#     if nota < 60:
#         mensagem = "Aluno reprovado!"
#     elif nota < 80:
#         mensagem = "Nota boa!"
#     else:
#         mensagem = "Nota excelente! Parabéns"

#     print(mensagem)



#teste valor com NOT
Média = int(input("Digite a MÉDIA do aluno:"))
Faltas = int(input("Digite a quantidade de faltas do aluno:"))
if not Média >= 7 and Faltas <= 25:
    print("Aluno aprovado")
else:
    print("Aluno reprovado")