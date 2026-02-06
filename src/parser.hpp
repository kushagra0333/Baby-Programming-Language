#pragma once
#include "arena.hpp"
#include <vector>
#include <string>
#include <optional>
#include <iostream>
#include <cstdlib>
#include <variant>
#include "types.hpp"
using ::bin_prec;

// Forward declarations
struct NodeStmt;
struct NodeExpr;


struct NodeTermStringLit{
    Token string_lit;
};

struct NodeTermIntLit{
    Token int_lit;
};

struct NodeTermIdent{
    Token ident;
};

struct NodeTermParen{
    NodeExpr* expr;
};

struct NodeTermFuncCall{
    Token ident;
    std::vector<NodeExpr*> args;
};

struct NodeTerm{
    std::variant<NodeTermIntLit*, NodeTermIdent*,NodeTermParen*,NodeTermStringLit*, NodeTermFuncCall*> var;
};

struct NodeBinExprAdd {
    NodeExpr* left;
    NodeExpr* right;
};

struct NodeBinExprSub {
    NodeExpr* left;
    NodeExpr* right;
};
struct NodeBinExprDiv {
    NodeExpr* left;
    NodeExpr* right;
};
struct NodeBinExprMulti{
     NodeExpr* left;
     NodeExpr* right;
};

struct NodeBinExprEq{
    NodeExpr* left;
    NodeExpr* right;
};
struct NodeBinExprNeq{
    NodeExpr* left;
    NodeExpr* right;
};
struct NodeBinExprLt{
    NodeExpr* left;
    NodeExpr* right;
};
struct NodeBinExprGt{
    NodeExpr* left;
    NodeExpr* right;
};
struct NodeBinExprLte{
    NodeExpr* left;
    NodeExpr* right;
};
struct NodeBinExprGte{
    NodeExpr* left;
    NodeExpr* right;
};

struct NodeBinExpr{
    std::variant<NodeBinExprAdd*, NodeBinExprSub*, NodeBinExprDiv*, NodeBinExprMulti*, NodeBinExprEq*, NodeBinExprNeq*, NodeBinExprLt*, NodeBinExprGt*, NodeBinExprLte*, NodeBinExprGte*> var;
};

struct NodeExpr{
    std::variant<NodeTerm*, NodeBinExpr*> var;
};

struct NodeStmtKitchenClosed{
    NodeExpr* expr;
};

struct NodeStmtIngredient{
    Token ident;
    NodeExpr* expr;
};

struct NodeScope
{
    std::vector<NodeStmt*> stmts;
};

struct NodeStmtServe
{
    NodeScope* scope;
};

struct NodeStmtRetaste
{
    NodeExpr* condition;
    NodeScope* scope;
};

struct NodeStmtTaste
{
    NodeExpr* condition;
    NodeScope* scope;
    std::vector<NodeStmtRetaste*> elifs;
    std::optional<NodeStmtServe*> else_stmt;
};

struct NodeStmtSimmer
{
    NodeExpr* condition;
    NodeScope* scope;
};


struct NodeStmtPlate{
    NodeExpr* expr;
};

struct NodeStmtAssign{
    Token ident;
    NodeExpr* expr;
};

struct NodeStmtRest{
};

struct NodeStmtFinish{
    NodeExpr* expr;
};


struct NodeFuncDef{
    Token name;
    std::vector<std::pair<Token, Token>> args; // Type, Name
    NodeScope* scope;
    Token return_type; // recipe
};

struct NodeStmt{
    std::variant<NodeStmtKitchenClosed*, NodeStmtIngredient*, NodeStmtPlate*, NodeStmtTaste*, NodeStmtServe*, NodeStmtSimmer*, NodeStmtRetaste*, NodeScope*, NodeStmtAssign*, NodeStmtRest*, NodeFuncDef*, NodeStmtFinish*> var;
};

struct NodeProgram{
    std::vector<NodeStmt> stmts;
};


class Parser {
    public:
        inline explicit Parser(std::vector<Token> tokens) : m_tokens(std::move(tokens)), m_alloc(1024 * 1024*4)
        {}


        std::optional<NodeTerm*> parse_term()
        {
            if(auto int_lit =try_consume(TokenType::int_lit))
            {
                auto Term_expr_int_lit = m_alloc.alloc<NodeTermIntLit>();
                Term_expr_int_lit->int_lit=int_lit.value();
                auto expr= m_alloc.alloc<NodeTerm>();
                expr->var=Term_expr_int_lit;
                return expr;
            }
            else if(auto ident = try_consume(TokenType::ident))
            {
                if(try_consume(TokenType::open_paren))
                {
                     auto term_call = m_alloc.alloc<NodeTermFuncCall>();
                     term_call->ident = ident.value();
                     if(!try_consume(TokenType::close_paren))
                     {
                         while(true)
                         {
                             if(auto arg = parse_expr())
                             {
                                 term_call->args.push_back(arg.value());
                             }
                             else
                             {
                                 error("Invalid argument expression");
                             }
                             if(try_consume(TokenType::close_paren)) break;
                             try_consume(TokenType::comma, "Expected ',' or ')' in argument list");
                         }
                     }
                     auto expr = m_alloc.alloc<NodeTerm>();
                     expr->var = term_call;
                     return expr;
                }

                auto Term_expr_ident = m_alloc.alloc<NodeTermIdent>();
                Term_expr_ident->ident = ident.value();
                auto expr = m_alloc.alloc<NodeTerm>();
                expr->var = Term_expr_ident;
                return expr;
            }
            else if(auto open_paren = try_consume(TokenType::open_paren))
            {
                auto expr = parse_expr();
                if(!expr.has_value())
                {
                    error("Invalid expression inside parentheses");
                }
                try_consume(TokenType::close_paren, "expecting close parenthesis ')'");
                auto term_paren = m_alloc.alloc<NodeTermParen>();
                term_paren->expr=expr.value();
                auto term=m_alloc.alloc<NodeTerm>();
                term->var=term_paren;
                return term;
            }
            else if(auto double_quote = try_consume(TokenType::double_quotes))
            {
                if(auto string_lit=try_consume(TokenType::string_lit))
                {
                    if(auto close_quote = try_consume(TokenType::double_quotes))
                    {
                        auto Term_expr_string_lit = m_alloc.alloc<NodeTermStringLit>();
                        Term_expr_string_lit->string_lit=string_lit.value();
                        auto expr= m_alloc.alloc<NodeTerm>();
                        expr->var=Term_expr_string_lit;
                        return expr;
                    }
                }
                error("Invalid string literal");
            }

            return {};
        }

        std::optional<NodeExpr*> parse_expr(int min_prec=0)
        { 
            
            std::optional<NodeTerm*> term_lhs=parse_term();
            if(!term_lhs.has_value())
            {
                return {};
            }

            auto expr_lhs=m_alloc.alloc<NodeExpr>();
            expr_lhs->var=term_lhs.value();
            
            while(true)
            {
                std::optional<Token> curr_tok = peek();
                std::optional<int> prec;

                if(curr_tok.has_value())
                {
                    prec = bin_prec(curr_tok->type);
                    if(!prec.has_value() || prec.value() < min_prec)
                    {
                        break;
                    }
                }
                else
                {
                    break;
                }
                Token op = consume();
                int next_min_prec = prec.value()+1;
                auto expr_rhs = parse_expr(next_min_prec);
                if(!expr_rhs.has_value())
                {
                    error("Invalid right-hand side expression");
                }

                auto expr = m_alloc.alloc<NodeExpr>();
                auto expr_lhs2=m_alloc.alloc<NodeExpr>();
                if(op.type == TokenType::plus)
                {
                    auto add = m_alloc.alloc<NodeBinExprAdd>();
                    expr_lhs2->var = expr_lhs->var;
                    add->left=expr_lhs2;
                    add->right=expr_rhs.value();
                    auto bin_expr = m_alloc.alloc<NodeBinExpr>();
                    bin_expr->var = add;
                    expr->var = bin_expr;
                }
                else if(op.type == TokenType::mul)
                {
                    auto multi = m_alloc.alloc<NodeBinExprMulti>();
                    expr_lhs2->var = expr_lhs->var;
                    multi->left=expr_lhs2;
                    multi->right=expr_rhs.value();
                    auto bin_expr = m_alloc.alloc<NodeBinExpr>();
                    bin_expr->var = multi;
                    expr->var = bin_expr;
                }
                else if(op.type == TokenType::sub)
                {
                    auto sub = m_alloc.alloc<NodeBinExprSub>();
                    expr_lhs2->var = expr_lhs->var;
                    sub->left=expr_lhs2;
                    sub->right=expr_rhs.value();
                    auto bin_expr = m_alloc.alloc<NodeBinExpr>();
                    bin_expr->var = sub;
                    expr->var = bin_expr;
                }
                else if(op.type == TokenType::div)
                {
                    auto div = m_alloc.alloc<NodeBinExprDiv>();
                    expr_lhs2->var = expr_lhs->var;
                    div->left=expr_lhs2;
                    div->right=expr_rhs.value();
                    auto bin_expr = m_alloc.alloc<NodeBinExpr>();
                    bin_expr->var = div;
                    expr->var = bin_expr;
                }
                else if(op.type == TokenType::eq_eq)
                {
                    auto eq = m_alloc.alloc<NodeBinExprEq>();
                    expr_lhs2->var = expr_lhs->var;
                    eq->left=expr_lhs2;
                    eq->right=expr_rhs.value();
                    auto bin_expr = m_alloc.alloc<NodeBinExpr>();
                    bin_expr->var = eq;
                    expr->var = bin_expr;
                }
                else if(op.type == TokenType::neq)
                {
                    auto neq = m_alloc.alloc<NodeBinExprNeq>();
                    expr_lhs2->var = expr_lhs->var;
                    neq->left=expr_lhs2;
                    neq->right=expr_rhs.value();
                    auto bin_expr = m_alloc.alloc<NodeBinExpr>();
                    bin_expr->var = neq;
                    expr->var = bin_expr;
                }
                else if(op.type == TokenType::lt)
                {
                    auto lt = m_alloc.alloc<NodeBinExprLt>();
                    expr_lhs2->var = expr_lhs->var;
                    lt->left=expr_lhs2;
                    lt->right=expr_rhs.value();
                    auto bin_expr = m_alloc.alloc<NodeBinExpr>();
                    bin_expr->var = lt;
                    expr->var = bin_expr;
                }
                else if(op.type == TokenType::gt)
                {
                    auto gt = m_alloc.alloc<NodeBinExprGt>();
                    expr_lhs2->var = expr_lhs->var;
                    gt->left=expr_lhs2;
                    gt->right=expr_rhs.value();
                    auto bin_expr = m_alloc.alloc<NodeBinExpr>();
                    bin_expr->var = gt;
                    expr->var = bin_expr;
                }
                else if(op.type == TokenType::lte)
                {
                    auto lte = m_alloc.alloc<NodeBinExprLte>();
                    expr_lhs2->var = expr_lhs->var;
                    lte->left=expr_lhs2;
                    lte->right=expr_rhs.value();
                    auto bin_expr = m_alloc.alloc<NodeBinExpr>();
                    bin_expr->var = lte;
                    expr->var = bin_expr;
                }
                else if(op.type == TokenType::gte)
                {
                    auto gte = m_alloc.alloc<NodeBinExprGte>();
                    expr_lhs2->var = expr_lhs->var;
                    gte->left=expr_lhs2;
                    gte->right=expr_rhs.value();
                    auto bin_expr = m_alloc.alloc<NodeBinExpr>();
                    bin_expr->var = gte;
                    expr->var = bin_expr;
                }
                else{
                    error("Unknown binary operator");
                }

                expr_lhs->var = expr->var;
            }

            return expr_lhs;
        }


        std::optional<NodeScope*> parse_scope()
        {
            if(!try_consume(TokenType::open_curly).has_value())
            {
                return {};
            }
            auto scope = m_alloc.alloc<NodeScope>();
            while(auto stmt = parse_stmt())
            {
                auto node_stmt = m_alloc.alloc<NodeStmt>();
                *node_stmt = stmt.value();
                scope->stmts.push_back(node_stmt);
            }
            try_consume(TokenType::close_curly,"Expected '}'");
            return scope;
        }

        std::optional<NodeStmt> parse_stmt()
        {
            if(peek().has_value() && peek().value().type==TokenType::kitchen_closed && peek(1).has_value() && peek(1).value().type==TokenType::open_paren)
            {
                consume();
                consume();
                auto stmt_exit = m_alloc.alloc<NodeStmtKitchenClosed>();
                if(auto node_expr=parse_expr()) //parsing expression after 'kitchen_closed' token
                {
                    stmt_exit->expr=node_expr.value();
                }
                else{
                    error("Unexpected token encountered during parsing");
                }
                try_consume(TokenType::close_paren, "expecting close parenthesis ')'");
                try_consume(TokenType::semi, "expecting semicolon ';'");
                return NodeStmt{.var=stmt_exit};
            }
            else if(peek().has_value() && peek().value().type==TokenType::finish && peek(1).has_value() && peek(1).value().type==TokenType::open_paren)
            {
                consume();
                consume();
                auto stmt_finish = m_alloc.alloc<NodeStmtFinish>();
                if(auto node_expr=parse_expr())
                {
                    stmt_finish->expr=node_expr.value();
                }
                else{
                    error("Invalid expression in finish()");
                }
                try_consume(TokenType::close_paren, "expecting close parenthesis ')'");
                try_consume(TokenType::semi, "expecting semicolon ';'");
                return NodeStmt{.var=stmt_finish};
            }
            else if(peek().has_value() && peek().value().type == TokenType::recipe)
            {
                // Function Definition: recipe name ( ...
                Token ret_type = consume(); // recipe keyword
                Token name = try_consume(TokenType::ident, "Expected function name");
                try_consume(TokenType::open_paren, "Expected '(' after function name");
                
                auto func_def = m_alloc.alloc<NodeFuncDef>();
                func_def->return_type = ret_type;
                func_def->name = name;
                
                if(!try_consume(TokenType::close_paren))
                {
                    while(true)
                    {
                        Token type_tok;
                        if(peek().has_value() && peek().value().type==TokenType::ingredient)
                        {
                            type_tok = consume();
                        }
                        else
                        {
                            error("Expected 'ingredient' in function arguments");
                        }
                        
                        Token arg_name = try_consume(TokenType::ident, "Expected argument name");
                        func_def->args.push_back({type_tok, arg_name});

                        if(try_consume(TokenType::close_paren)) break;
                        try_consume(TokenType::comma, "Expected ',' or ')' in parameter list");
                    }
                }
                
                if(auto scope = parse_scope())
                {
                    func_def->scope = scope.value();
                }
                else
                {
                    error("Expected scope block for function definition");
                }
                return NodeStmt{.var=func_def};
            }
            else if(peek().has_value() && peek().value().type == TokenType::ingredient && peek(1).has_value() && peek(1).value().type==TokenType::ident)
            {
                // Variable Declaration: ingredient name = ...
                consume(); // consume 'ingredient' keyword
                auto stmt_ingredient = m_alloc.alloc<NodeStmtIngredient>();
                stmt_ingredient->ident=consume(); // consume identifier
                consume(); // consume '='
                if(auto expr=parse_expr()) //parsing expression after 'ingredient' token
                {
                    stmt_ingredient->expr=expr.value();
                }
                else{
                    error("Invalid Expression after 'ingredient'");
                }
                try_consume(TokenType::semi, "expecting semicolon ';'"); 
                return NodeStmt{.var=stmt_ingredient};
            }
            else if(peek().has_value() && peek().value().type == TokenType::open_curly)
            {
                if(auto scope = parse_scope()){
                    auto stmt = m_alloc.alloc<NodeStmt>();
                    stmt->var = scope.value();
                    return *stmt;
                }
                else{
                    error("Invalid scope");
                }
            }
            else if(peek().has_value() && peek().value().type == TokenType::plate && peek(1).has_value() && peek(1).value().type==TokenType::open_paren)
            {
                consume(); // consume 'plate' keyword
                consume(); // consume '('
                auto stmt_plate = m_alloc.alloc<NodeStmtPlate>();
                if(auto expr=parse_expr()) //parsing expression after 'plate' token
                {
                    stmt_plate->expr=expr.value();
                }
                else{
                    error("Invalid Expression after 'plate'");
                }
                try_consume(TokenType::close_paren, "expecting close parenthesis ')'");
                try_consume(TokenType::semi, "expecting semicolon ';'"); 
                return NodeStmt{.var=stmt_plate};
            }
            else if(auto taste = try_consume(TokenType::taste))
            {
                try_consume(TokenType::open_paren,"Expected '(' after 'taste'");
                auto stmt_taste = m_alloc.alloc<NodeStmtTaste>();
                if(auto expr = parse_expr())
                {
                    stmt_taste->condition=expr.value();
                }else
                {
                    error("Invalid expression inside parentheses");
                }
                try_consume(TokenType::close_paren,"Expected ')' after 'taste'");
                if(auto scope = parse_scope())
                {
                    stmt_taste->scope=scope.value();
                }
                else{
                    error("Invalid scope inside 'taste'");
                }

                // Check for elifs (retaste)
                while(auto retaste_tok = try_consume(TokenType::retaste))
                {
                    try_consume(TokenType::open_paren,"Expected '(' after 'retaste'");
                    auto stmt_retaste = m_alloc.alloc<NodeStmtRetaste>();
                    if(auto expr = parse_expr())
                    {
                        stmt_retaste->condition=expr.value();
                    }else
                    {
                        error("Invalid expression inside parentheses");
                    }
                    try_consume(TokenType::close_paren,"Expected ')' after 'retaste'");
                    if(auto scope = parse_scope())
                    {
                        stmt_retaste->scope=scope.value();
                    }
                    else{
                        error("Invalid scope inside 'retaste'");
                    }
                    stmt_taste->elifs.push_back(stmt_retaste);
                }

                // Check for else (serve)
                if(auto serve_tok = try_consume(TokenType::serve))
                {
                    auto stmt_serve = m_alloc.alloc<NodeStmtServe>();
                    if(auto scope = parse_scope())
                    {
                        stmt_serve->scope=scope.value();
                    }
                    else{
                        error("Invalid scope inside 'serve'");
                    }
                    stmt_taste->else_stmt = stmt_serve;
                }

                auto stmt=m_alloc.alloc<NodeStmt>();
                stmt->var=stmt_taste;
                return *stmt;
            }
            else if(auto simmer = try_consume(TokenType::simmer))
            {
                try_consume(TokenType::open_paren,"Expected '(' after 'simmer'");
                auto stmt_simmer = m_alloc.alloc<NodeStmtSimmer>();
                if(auto expr = parse_expr())
                {
                    stmt_simmer->condition=expr.value();
                }else
                {
                    error("Invalid expression inside parentheses");
                }
                try_consume(TokenType::close_paren,"Expected ')' after 'simmer'");
                if(auto scope = parse_scope())
                {
                    stmt_simmer->scope=scope.value();
                }
                else{
                    error("Invalid scope inside 'simmer'");
                }
                auto stmt=m_alloc.alloc<NodeStmt>();
                stmt->var=stmt_simmer;
                return *stmt;
            }
            else if(peek().has_value() && peek().value().type==TokenType::ident && peek(1).has_value() && peek(1).value().type==TokenType::eq)
            {
                auto stmt_assign = m_alloc.alloc<NodeStmtAssign>();
                stmt_assign->ident = consume();
                consume(); // consume '='
                if(auto expr=parse_expr())
                {
                    stmt_assign->expr = expr.value();
                }
                else{
                    error("Invalid Expression after assignment");
                }
                try_consume(TokenType::semi, "expecting semicolon ';'");
                return NodeStmt{.var=stmt_assign};
            }
            else if(auto rest_tok=try_consume(TokenType::rest))
            {
               try_consume(TokenType::semi, "expecting semicolon ';'");
               auto stmt_rest = m_alloc.alloc<NodeStmtRest>();
               return NodeStmt{.var=stmt_rest}; 
            }
            
            return {};
        }


        std::optional<NodeProgram> parse_prog()
        {
            NodeProgram prog;
            while(peek().has_value())
            {
                if(auto stmt=parse_stmt())
                {
                    prog.stmts.push_back(stmt.value());
                }
                else{
                    error("Invalid Statement encountered during parsing");
                }
            }
            return prog;
        }





    private:
    [[nodiscard]] inline std::optional<Token> peek(int offset=0) const 
    {
        if(position+offset >= m_tokens.size())
        {
            return {};
        }
        else
        {
            return m_tokens[position+offset];
        }
    }

    inline Token consume() 
    {
        return m_tokens[position++];
    }

    void error(const std::string& msg) const
    {
        std::cerr << "[Parser Error] ";
        if(peek().has_value())
        {
             const auto& tok = peek().value();
             std::cerr << "Line " << tok.line << ":" << tok.col << " >>> ";
        }
        else if (position > 0 && position <= m_tokens.size()) {
             const auto& tok = m_tokens[position-1];
             std::cerr << "Line " << tok.line << ":" << tok.col << " (after this) >>> ";
        }
        else {
             std::cerr << "(at EOF) >>> ";
        }
        std::cerr << msg << std::endl;
        exit(EXIT_FAILURE);
    }

    inline Token try_consume(TokenType type,const std::string& err_msg) 
    {
        if(peek().has_value() && peek().value().type==type)
        {
            return consume();
        }
        else
        {
            error(err_msg);
            return {}; // Unreachable
        }
    }


    inline std::optional<Token> try_consume(TokenType type) 
    {
        if(peek().has_value() && peek().value().type==type)
        {
            return consume();
        }
        else
        {
            return {};
        }
    }



    ArenaAllocation m_alloc; 

        const std::vector<Token> m_tokens; 
        size_t position = 0;
};