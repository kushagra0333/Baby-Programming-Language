#pragma once

#include <string>
#include <optional>

enum class TokenType {
    kitchen_closed, // exit
    int_lit,
    semi,
    open_paren,
    close_paren,
    ident,
    ingredient, // variable declaration
    eq,
    plus,
    mul,
    sub,
    div,
    open_curly, // {
    close_curly, // }
    plate, // print
    string_lit,
    double_quotes,
    recipe, // function definition
    taste, // if condition
    serve, // else condition
    simmer, // while loop
    retaste, // else if
    cookbook, // multiline comment
    note, // single line comment
    eq_eq, // ==
    neq, // !=
    lt, // <
    gt, // >
    lte, // <=
    gte, // >=
    rest, // newline
    comma, // ,
    finish // return
};

bool is_bin_op(TokenType type){
    switch(type){
        case TokenType::plus:
        case TokenType::mul:
        case TokenType::sub:
        case TokenType::div:
        case TokenType::eq_eq:
        case TokenType::neq:
        case TokenType::lt:
        case TokenType::gt:
        case TokenType::lte:
        case TokenType::gte:
            return true;
        default:
            return false;
    }
}


std::optional<int> bin_prec(TokenType type){
    switch(type){
        case TokenType::mul:
        case TokenType::div:
            return 2;
        case TokenType::plus:
        case TokenType::sub:
            return 1;
        case TokenType::eq_eq:
        case TokenType::neq:
        case TokenType::lt:
        case TokenType::gt:
        case TokenType::lte:
        case TokenType::gte:
            return 0;
        default:
            return {};
    }
}


struct Token {
    TokenType type;
    int line;
    int col;
    std::optional<std::string> value {};
};
