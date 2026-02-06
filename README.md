# Cook Programming Language

welcome to **Cook**, the language that understands your relationship status. Why code in binary when you can code in _complicated feelings_?

## 🍳 What is Cook?

**Cook** is a programming language designed to simulate the emotional rollercoaster of a messy breakup. It features keywords like `kitchen_closed`, `ingredient`, `taste`, and `simmer` to make your code feel as unstable as your ex.

## 📜 Syntax

### Variable Declaration

Use `ingredient` to declare variables.

```cook
ingredient x = 10;
ingredient y = 20;
```

### Printing

Use `plate` to print to the console.

```cook
plate(x);
```

### Conditionals

Use `taste`, `retaste`, and `serve` for logic.

```cook
taste(x > y) {
    plate("Start cooking");
} retaste(x == y) {
    plate("Still confused");
} serve {
    plate("Kitchen closed");
}
```

### Loops

Use `simmer` for loops.

```cook
simmer(x > 0) {
    plate(x);
    x = x - 1;
}
```

### Comments

```cook
note This is a comment
cookbook
This is a
multiline comment
cookbook
```

## 🛠️ Build & Run

1. **Build the project:**

   ```bash
   cmake -S . -B build
   cmake --build build
   ```

2. **Run the compiler:**
   ```bash
   ./build/cook ../test.cook
   ```
