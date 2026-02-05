section .text
global _start

func_calculate_viability:
    push rbp
    mov rbp, rsp
    push QWORD [rbp + 16]
    push QWORD [rbp + 24]
    mov rax, QWORD [rsp + 0]
    push rax
    mov rax, QWORD [rsp + 16]
    push rax
    mov rax, 2
    push rax
    pop rbx
    pop rax
    mul rbx
    push rax
    pop rbx
    pop rax
    cmp rax, rbx
    setg al
    movzx rax, al
    push rax
    pop rax
    test rax, rax 
    jz label1
    mov rax, 1
    mov rdi, 1
    lea rsi, [rel newline_const]
    mov rdx, 1
    syscall
    mov rax, 1
    mov rdi, 1
    lea rsi, [rel msg_0]
    mov rdx, 22
    syscall
    mov rax, 0
    push rax
    pop rax
    leave
    ret
    add rsp, 0
    jmp label0
label1:
label0:
    mov rax, QWORD [rsp + 8]
    push rax
    mov rax, 10
    push rax
    pop rbx
    pop rax
    mul rbx
    push rax
    mov rax, QWORD [rsp + 8]
    push rax
    pop rbx
    pop rax
    xor rdx, rdx
    div rbx
    push rax
    mov rax, QWORD [rsp + 0]
    push rax
    pop rax
    leave
    ret
    add rsp, 8
    mov rax, 0
    leave
    ret

_start:
    mov rax, 50
    push rax
    mov rax, 2
    push rax
    mov rax, 1
    mov rdi, 1
    lea rsi, [rel msg_1]
    mov rdx, 24
    syscall
    mov rax, 1
    mov rdi, 1
    lea rsi, [rel newline_const]
    mov rdx, 1
    syscall
    mov rax, QWORD [rsp + 8]
    push rax
    mov rax, QWORD [rsp + 8]
    push rax
    call func_calculate_viability
    add rsp, 16
    push rax
    mov rax, QWORD [rsp + 0]
    push rax
    mov rax, 5
    push rax
    pop rbx
    pop rax
    cmp rax, rbx
    setl al
    movzx rax, al
    push rax
    pop rax
    test rax, rax 
    jz label3
    mov rax, 1
    mov rdi, 1
    lea rsi, [rel msg_2]
    mov rdx, 21
    syscall
    mov rax, 1
    mov rdi, 1
    lea rsi, [rel newline_const]
    mov rdx, 1
    syscall
    mov rax, 1
    mov rdi, 1
    lea rsi, [rel msg_3]
    mov rdx, 44
    syscall
    add rsp, 0
    jmp label2
label3:
    mov rax, 1
    mov rdi, 1
    lea rsi, [rel msg_4]
    mov rdx, 22
    syscall
    mov rax, 1
    mov rdi, 1
    lea rsi, [rel msg_5]
    mov rdx, 17
    syscall
    add rsp, 0
label2:
    mov rax, 0
    push rax
    mov rax, 60
    pop rdi
    syscall
    mov rax, 60
    mov rdi, 0
    syscall

print_int:
    push rbp
    mov rbp, rsp
    sub rsp, 32
    mov rax, rdi
    lea rsi, [rel buffer]
    mov rcx, 0
    cmp rax, 0
    jge .L1
    neg rax
    mov byte [rsi], '-'
    inc rsi
    inc rcx
.L1:
    mov r8, 10
    mov r9, 0
.L2:
    xor edx, edx
    div r8
    add dl, '0'
    push rdx
    inc r9
    cmp rax, 0
    jne .L2
.L3:
    pop rax
    mov byte [rsi], al
    inc rsi
    inc rcx
    dec r9
    jne .L3
    mov byte [rsi], 10
    inc rcx
    mov rax, 1
    mov rdi, 1
    lea rsi, [rel buffer]
    mov rdx, rcx
    syscall
    leave
    ret

section .bss
buffer: resb 32

section .data
newline_const: db 10, 0
msg_5: db "Plan the wedding.", 0
msg_4: db "Viability Score: Good.", 0
msg_2: db "Viability Score: Low.", 0
msg_1: db "Calculating viability...", 0
msg_3: db "It is not you, it is... actually, it is you.", 0
msg_0: db "Stage 5 Clinger Alert.", 0
