/**
 * All lesson content for the 8-week club, consumed by src/db/seed.ts.
 * Edit freely — re-run `npm run db:seed` to push changes to the database.
 * (Existing student progress is kept; steps are matched by week + order.)
 */

export type SeedStep = {
  order: number;
  type: "teach" | "quiz" | "code" | "predict" | "debug" | "turtle";
  title: string;
  contentMd: string;
  starterCode?: string;
  solutionCode?: string;
  testsJson?: unknown[];
  hintsJson?: string[];
  xpReward: number;
};

export type SeedLesson = {
  weekNo: number;
  slug: string;
  title: string;
  introMd: string;
  steps: SeedStep[];
};

const stdout = (equals: string, stdin?: string[]) => [
  stdin ? { kind: "stdout", equals, stdin } : { kind: "stdout", equals },
];
const choice = (answer: string, choices: string[]) => [
  { kind: "choice", answer, choices },
];
const text = (equals: string) => [{ kind: "text", equals }];

// ---------------------------------------------------------------------------

const WEEK_1: SeedLesson = {
  weekNo: 1,
  slug: "week-1-hello-python",
  title: "Hello, Python!",
  introMd:
    "Code is a list of instructions for a computer. Python reads them from the top down. This week we make the computer **talk** using `print()`.",
  steps: [
    {
      order: 1,
      type: "teach",
      title: "What is print?",
      contentMd:
        "`print()` shows a message on the screen.\n\n```python\nprint(\"Hello!\")\n```\n\nThe words go **inside the brackets** and **inside quotes**. When you press Run, the computer says `Hello!` back to you.",
      xpReward: 5,
    },
    {
      order: 2,
      type: "code",
      title: "Make the computer say hello",
      contentMd:
        "Write a line that prints the word **Hello!** exactly.\n\nUse the symbol buttons under the editor for `(` `)` and `\"`.",
      starterCode: "# type your code here\n",
      solutionCode: 'print("Hello!")',
      testsJson: stdout("Hello!"),
      hintsJson: [
        "Start with the word print.",
        'Put ( ) after print, and " " around your message.',
        'The whole line is: print("Hello!")',
      ],
      xpReward: 30,
    },
    {
      order: 3,
      type: "quiz",
      title: "Which line is right?",
      contentMd: "Which line prints the word **cat**?",
      testsJson: choice("B", ["print(cat)", 'print("cat")', "say cat"]),
      xpReward: 20,
    },
    {
      order: 4,
      type: "predict",
      title: "Read it in your head",
      contentMd:
        "Look at this program. What will it print? Type your answer exactly.",
      solutionCode: 'print("3")\nprint("2")\nprint("1")\nprint("Go!")',
      testsJson: text("3\n2\n1\nGo!"),
      hintsJson: ["Each print() goes on its own new line."],
      xpReward: 15,
    },
    {
      order: 5,
      type: "debug",
      title: "Fix the broken line",
      contentMd:
        "This program should print **I love code** but it has a mistake. Fix it so it runs.",
      starterCode: "print(I love code)",
      solutionCode: 'print("I love code")',
      testsJson: stdout("I love code"),
      hintsJson: [
        "Words the computer should show need quotes around them.",
        'Add " before I and after code.',
      ],
      xpReward: 25,
    },
  ],
};

// ---------------------------------------------------------------------------

const WEEK_2: SeedLesson = {
  weekNo: 2,
  slug: "week-2-variables",
  title: "Variables & the computer's memory",
  introMd:
    "A **variable** is a labelled box where the computer keeps something so it can use it later. This week we make boxes, fill them, and ask the player questions with `input()`.",
  steps: [
    {
      order: 1,
      type: "teach",
      title: "Boxes with labels",
      contentMd:
        "You make a variable with an `=` sign:\n\n```python\nage = 10\npet = \"cat\"\n```\n\nThe **name** is on the left, the **value** is on the right. After that, using the name gives you back the value:\n\n```python\nprint(age)   # shows 10\n```",
      xpReward: 5,
    },
    {
      order: 2,
      type: "code",
      title: "Make a variable",
      contentMd:
        "Make a variable called `pet` and set it to the word **cat**. Then print `pet`.",
      starterCode: "pet = \n\nprint(pet)\n",
      solutionCode: 'pet = "cat"\nprint(pet)',
      testsJson: stdout("cat"),
      hintsJson: [
        "The word cat needs quotes: \"cat\".",
        'Line 1 should be: pet = "cat"',
      ],
      xpReward: 20,
    },
    {
      order: 3,
      type: "quiz",
      title: "Spot the variable",
      contentMd: "Which line makes a variable called `score`?",
      testsJson: choice("B", ["print(score)", "score = 10", "10 = score"]),
      xpReward: 15,
    },
    {
      order: 4,
      type: "code",
      title: "Join words together",
      contentMd:
        "Two variables are already made for you. Print them on one line so it says **Hello Sam** (with a space in the middle).",
      starterCode: 'greeting = "Hello"\nname = "Sam"\n\nprint()\n',
      solutionCode: 'greeting = "Hello"\nname = "Sam"\nprint(greeting, name)',
      testsJson: stdout("Hello Sam"),
      hintsJson: [
        "print() can take two things separated by a comma.",
        "print(greeting, name) puts a space between them.",
      ],
      xpReward: 25,
    },
    {
      order: 5,
      type: "predict",
      title: "Changing a box",
      contentMd: "A variable can be changed. What does this print?",
      solutionCode: "x = 2\nx = 9\nprint(x)",
      testsJson: text("9"),
      hintsJson: ["The second line replaces what's in the box."],
      xpReward: 15,
    },
    {
      order: 6,
      type: "code",
      title: "Ask the player a question",
      contentMd:
        "`input()` waits for the player to type something and gives it back.\n\nAsk for a name and then say hi to it. If the player types **Alex**, it should print **Hi Alex**.",
      starterCode: 'name = input()\n\nprint()\n',
      solutionCode: 'name = input()\nprint("Hi", name)',
      testsJson: stdout("Hi Alex", ["Alex"]),
      hintsJson: [
        "Store the answer: name = input()",
        'Then: print("Hi", name)',
      ],
      xpReward: 30,
    },
  ],
};

// ---------------------------------------------------------------------------

const WEEK_3: SeedLesson = {
  weekNo: 3,
  slug: "week-3-numbers",
  title: "Numbers & maths",
  introMd:
    "Python is a great calculator. This week: `+ - * /`, whole-number division `//`, and turning text into numbers with `int()`.",
  steps: [
    {
      order: 1,
      type: "teach",
      title: "Python can do maths",
      contentMd:
        "You can do sums straight in `print()`:\n\n```python\nprint(5 + 3)    # 8\nprint(10 - 4)   # 6\nprint(6 * 7)    # 42  (* means times)\nprint(20 / 4)   # 5.0 (/ means divide)\n```\n\nNo quotes around numbers — quotes would make them text!",
      xpReward: 5,
    },
    {
      order: 2,
      type: "code",
      title: "Add two numbers",
      contentMd: "Print the answer to **12 + 8**.",
      starterCode: "print()\n",
      solutionCode: "print(12 + 8)",
      testsJson: stdout("20"),
      hintsJson: ["No quotes around the numbers.", "print(12 + 8)"],
      xpReward: 20,
    },
    {
      order: 3,
      type: "quiz",
      title: "Whole-number divide",
      contentMd:
        "`//` divides and throws away the leftover. What does `7 // 2` give?",
      testsJson: choice("B", ["3.5", "3", "1"]),
      xpReward: 15,
    },
    {
      order: 4,
      type: "predict",
      title: "Which sum happens first?",
      contentMd: "Python does `*` before `+`, just like in maths. What prints?",
      solutionCode: "print(2 + 3 * 4)",
      testsJson: text("14"),
      hintsJson: ["Do 3 * 4 first, then add 2."],
      xpReward: 15,
    },
    {
      order: 5,
      type: "code",
      title: "Double it",
      contentMd:
        "`int()` turns typed text into a number so you can do maths with it.\n\nAsk for a number and print **double** it. If the player types **15**, print **30**.",
      starterCode: "n = int(input())\n\nprint()\n",
      solutionCode: "n = int(input())\nprint(n * 2)",
      testsJson: stdout("30", ["15"]),
      hintsJson: ["Double means times 2.", "print(n * 2)"],
      xpReward: 25,
    },
    {
      order: 6,
      type: "debug",
      title: "Numbers vs words",
      contentMd:
        "This should take a number and print the **next** number. It crashes because `input()` gives back *text*, not a number. Fix it.",
      starterCode: 'age = input()\nprint(age + 1)',
      solutionCode: "age = int(input())\nprint(age + 1)",
      testsJson: stdout("10", ["9"]),
      hintsJson: [
        "Wrap the input in int( ) to make it a number.",
        "age = int(input())",
      ],
      xpReward: 30,
    },
  ],
};

// ---------------------------------------------------------------------------

const WEEK_4: SeedLesson = {
  weekNo: 4,
  slug: "week-4-choices",
  title: "Making choices",
  introMd:
    "Programs get interesting when they can **decide** things. This week: `if`, `else`, `elif`, and comparing values with `==`, `>`, `<`.",
  steps: [
    {
      order: 1,
      type: "teach",
      title: "if and else",
      contentMd:
        "`if` runs some lines **only when** something is true:\n\n```python\nage = 12\nif age >= 10:\n    print(\"double digits!\")\nelse:\n    print(\"still single digits\")\n```\n\nThe lines that belong to the `if` are **indented** (pushed in with 4 spaces). Use `==` to check if two things are equal.",
      xpReward: 5,
    },
    {
      order: 2,
      type: "code",
      title: "Big or small",
      contentMd:
        "Ask for a number. If it is **more than 10**, print `big`. Otherwise print `small`.\n\nIf the player types **15**, print **big**.",
      starterCode:
        'n = int(input())\nif n > 10:\n    print("big")\nelse:\n    print()\n',
      solutionCode:
        'n = int(input())\nif n > 10:\n    print("big")\nelse:\n    print("small")',
      testsJson: stdout("big", ["15"]),
      hintsJson: ['Fill the else line: print("small")'],
      xpReward: 25,
    },
    {
      order: 3,
      type: "quiz",
      title: "Is it equal?",
      contentMd: "Which symbol asks **“is this equal to that?”**",
      testsJson: choice("B", ["=", "==", "=>"]),
      xpReward: 15,
    },
    {
      order: 4,
      type: "predict",
      title: "The elif ladder",
      contentMd:
        "`elif` means “else, if…”. Python checks each one from the top and stops at the first true one. What prints?",
      solutionCode:
        'score = 75\nif score >= 90:\n    print("A")\nelif score >= 70:\n    print("B")\nelse:\n    print("C")',
      testsJson: text("B"),
      hintsJson: ["75 is not >= 90, but it is >= 70."],
      xpReward: 15,
    },
    {
      order: 5,
      type: "code",
      title: "Secret password",
      contentMd:
        "Ask for the password. If it is exactly `swordfish`, print `Access granted`. Otherwise print `Nope`.\n\nTest: the player types **swordfish** → **Access granted**.",
      starterCode: 'word = input()\nif word == "swordfish":\n    print()\nelse:\n    print("Nope")\n',
      solutionCode:
        'word = input()\nif word == "swordfish":\n    print("Access granted")\nelse:\n    print("Nope")',
      testsJson: stdout("Access granted", ["swordfish"]),
      hintsJson: ['Fill in: print("Access granted")'],
      xpReward: 25,
    },
    {
      order: 6,
      type: "debug",
      title: "Missing colon",
      contentMd:
        "Every `if` line ends with a colon `:` and the next line is indented. Fix this so it prints `yes`.",
      starterCode: 'if 5 > 3\nprint("yes")',
      solutionCode: 'if 5 > 3:\n    print("yes")',
      testsJson: stdout("yes"),
      hintsJson: [
        "Add a : at the end of the if line.",
        "Push the print line in with 4 spaces.",
      ],
      xpReward: 30,
    },
  ],
};

// ---------------------------------------------------------------------------

const WEEK_5: SeedLesson = {
  weekNo: 5,
  slug: "week-5-loops",
  title: "Loops",
  introMd:
    "Loops let the computer do something over and over without you writing it out. This week: `for` with `range()`, and `while`.",
  steps: [
    {
      order: 1,
      type: "teach",
      title: "Doing things again",
      contentMd:
        "A `for` loop repeats the indented lines:\n\n```python\nfor i in range(3):\n    print(\"hello\")\n```\n\nThat prints `hello` three times. `range(1, 6)` counts **1, 2, 3, 4, 5** (it stops *before* the last number).",
      xpReward: 5,
    },
    {
      order: 2,
      type: "code",
      title: "Count to 5",
      contentMd: "Use a loop to print the numbers **1 to 5**, each on its own line.",
      starterCode: "for i in range(1, 6):\n    print()\n",
      solutionCode: "for i in range(1, 6):\n    print(i)",
      testsJson: stdout("1\n2\n3\n4\n5"),
      hintsJson: ["Print the loop variable: print(i)"],
      xpReward: 25,
    },
    {
      order: 3,
      type: "quiz",
      title: "How many times?",
      contentMd: "How many times does `for i in range(3):` repeat?",
      testsJson: choice("B", ["2", "3", "4"]),
      xpReward: 15,
    },
    {
      order: 4,
      type: "predict",
      title: "Adding in a loop",
      contentMd:
        "`total` starts at 0 and grows each time round the loop. What prints at the end?",
      solutionCode:
        "total = 0\nfor n in [1, 2, 3, 4]:\n    total = total + n\nprint(total)",
      testsJson: text("10"),
      hintsJson: ["1 + 2 + 3 + 4"],
      xpReward: 20,
    },
    {
      order: 5,
      type: "code",
      title: "Rocket countdown",
      contentMd:
        "A `while` loop repeats **as long as** something is true. Finish this countdown so it prints `3`, `2`, `1`, then `Go!`.",
      starterCode:
        'count = 3\nwhile count > 0:\n    print(count)\n    count = count - 1\nprint()\n',
      solutionCode:
        'count = 3\nwhile count > 0:\n    print(count)\n    count = count - 1\nprint("Go!")',
      testsJson: stdout("3\n2\n1\nGo!"),
      hintsJson: ['The last line should be print("Go!")'],
      xpReward: 25,
    },
    {
      order: 6,
      type: "debug",
      title: "Off by one",
      contentMd:
        "This should print **1 to 5**, but it stops early. Remember `range` stops *before* the last number. Fix it.",
      starterCode: "for i in range(1, 5):\n    print(i)",
      solutionCode: "for i in range(1, 6):\n    print(i)",
      testsJson: stdout("1\n2\n3\n4\n5"),
      hintsJson: ["Change 5 to 6 so it includes the 5."],
      xpReward: 25,
    },
  ],
};

// ---------------------------------------------------------------------------

const WEEK_6: SeedLesson = {
  weekNo: 6,
  slug: "week-6-lists",
  title: "Lists",
  introMd:
    "A **list** holds lots of things in order — like a shopping list. This week: making lists, picking items out, counting them, and adding more.",
  steps: [
    {
      order: 1,
      type: "teach",
      title: "A list holds many things",
      contentMd:
        "Make a list with square brackets:\n\n```python\nfruits = [\"apple\", \"pear\", \"plum\"]\n```\n\nPick an item by its **position**, starting at **0**:\n\n```python\nprint(fruits[0])   # apple\nprint(fruits[2])   # plum\nprint(len(fruits)) # 3  (how many)\n```",
      xpReward: 5,
    },
    {
      order: 2,
      type: "code",
      title: "First in the list",
      contentMd: "Print the **first** pet in this list.",
      starterCode: 'pets = ["dog", "cat", "fish"]\nprint()\n',
      solutionCode: 'pets = ["dog", "cat", "fish"]\nprint(pets[0])',
      testsJson: stdout("dog"),
      hintsJson: ["The first item is number 0: pets[0]"],
      xpReward: 20,
    },
    {
      order: 3,
      type: "quiz",
      title: "Where does counting start?",
      contentMd: "What position number is the **first** item in a list?",
      testsJson: choice("B", ["1", "0", "-1"]),
      xpReward: 15,
    },
    {
      order: 4,
      type: "predict",
      title: "Loop over a list",
      contentMd: "A `for` loop can go through each item. What does this print?",
      solutionCode: 'for c in ["red", "green", "blue"]:\n    print(c)',
      testsJson: text("red\ngreen\nblue"),
      hintsJson: ["One line per item, in order."],
      xpReward: 15,
    },
    {
      order: 5,
      type: "code",
      title: "Add to the list",
      contentMd:
        "`.append()` adds something to the end of a list. Add `30` to `scores`, then print the whole list. It should print `[10, 20, 30]`.",
      starterCode: "scores = [10, 20]\n\nprint(scores)\n",
      solutionCode: "scores = [10, 20]\nscores.append(30)\nprint(scores)",
      testsJson: stdout("[10, 20, 30]"),
      hintsJson: ["scores.append(30)"],
      xpReward: 25,
    },
    {
      order: 6,
      type: "debug",
      title: "Off the end",
      contentMd:
        "This list has 2 items (positions 0 and 1). Position 2 doesn't exist, so it crashes. Fix it to print the **last** colour.",
      starterCode: 'colours = ["red", "blue"]\nprint(colours[2])',
      solutionCode: 'colours = ["red", "blue"]\nprint(colours[1])',
      testsJson: stdout("blue"),
      hintsJson: ["The second item is position 1, not 2."],
      xpReward: 25,
    },
  ],
};

// ---------------------------------------------------------------------------

const WEEK_7: SeedLesson = {
  weekNo: 7,
  slug: "week-7-functions",
  title: "Functions",
  introMd:
    "A **function** is your own command that you can use again and again. This week: `def`, giving it information (parameters), and getting an answer back with `return`.",
  steps: [
    {
      order: 1,
      type: "teach",
      title: "Make your own command",
      contentMd:
        "You **define** a function with `def`, then **call** it by name:\n\n```python\ndef say_hello():\n    return \"Hello!\"\n\nprint(say_hello())\n```\n\n`return` sends a value back to wherever you called it. The `()` after the name is how you actually run it.",
      xpReward: 5,
    },
    {
      order: 2,
      type: "code",
      title: "A greet function",
      contentMd:
        "Finish `greet` so that `greet(\"Sam\")` gives back `Hello, Sam!`. The `print` at the bottom should then show **Hello, Sam!**",
      starterCode: 'def greet(name):\n    return \n\nprint(greet("Sam"))\n',
      solutionCode:
        'def greet(name):\n    return "Hello, " + name + "!"\n\nprint(greet("Sam"))',
      testsJson: stdout("Hello, Sam!"),
      hintsJson: [
        'Join three pieces: "Hello, " then name then "!"',
        'return "Hello, " + name + "!"',
      ],
      xpReward: 30,
    },
    {
      order: 3,
      type: "quiz",
      title: "What does return do?",
      contentMd: "What does `return` do inside a function?",
      testsJson: choice("B", [
        "Prints a value on the screen",
        "Sends a value back to whoever called the function",
        "Stops the whole program",
      ]),
      xpReward: 15,
    },
    {
      order: 4,
      type: "predict",
      title: "Calling twice",
      contentMd: "One function, used twice. What prints?",
      solutionCode:
        "def double(n):\n    return n * 2\n\nprint(double(3))\nprint(double(10))",
      testsJson: text("6\n20"),
      hintsJson: ["Work out double(3), then double(10)."],
      xpReward: 15,
    },
    {
      order: 5,
      type: "code",
      title: "Add function",
      contentMd:
        "Write a function `add` that takes **two** numbers and returns their total. `add(4, 5)` should give `9`.",
      starterCode: "def add(a, b):\n    return \n\nprint(add(4, 5))\n",
      solutionCode: "def add(a, b):\n    return a + b\n\nprint(add(4, 5))",
      testsJson: stdout("9"),
      hintsJson: ["return a + b"],
      xpReward: 25,
    },
    {
      order: 6,
      type: "debug",
      title: "Forgot to call it",
      contentMd:
        "This prints something weird like `<function say_hi>` instead of `hi`. The function is never actually **called**. Fix it.",
      starterCode: 'def say_hi():\n    return "hi"\n\nprint(say_hi)',
      solutionCode: 'def say_hi():\n    return "hi"\n\nprint(say_hi())',
      testsJson: stdout("hi"),
      hintsJson: ["Add () after say_hi to run it."],
      xpReward: 25,
    },
  ],
};

// ---------------------------------------------------------------------------

const WEEK_8: SeedLesson = {
  weekNo: 8,
  slug: "week-8-guessing-game",
  title: "Mini-project: guessing game",
  introMd:
    "Time to put it all together and build a **number-guessing game** — variables, `input()`, `if`/`elif`, and a `while` loop. Then make it your own and show the class!",
  steps: [
    {
      order: 1,
      type: "teach",
      title: "The plan",
      contentMd:
        "Our game:\n\n1. The computer has a **secret number**.\n2. The player **guesses**.\n3. The computer says **too low**, **too high**, or **correct**.\n4. Keep going until they get it.\n\nWe'll build it one piece at a time.",
      xpReward: 5,
    },
    {
      order: 2,
      type: "code",
      title: "Secret and guess",
      contentMd:
        "The secret is `7`. Ask for one guess. If it matches, print `Correct!`, otherwise `Try again`.\n\nTest: player guesses **7** → **Correct!**",
      starterCode:
        'secret = 7\nguess = int(input())\nif guess == secret:\n    print()\nelse:\n    print("Try again")\n',
      solutionCode:
        'secret = 7\nguess = int(input())\nif guess == secret:\n    print("Correct!")\nelse:\n    print("Try again")',
      testsJson: stdout("Correct!", ["7"]),
      hintsJson: ['Fill in: print("Correct!")'],
      xpReward: 25,
    },
    {
      order: 3,
      type: "code",
      title: "Higher or lower",
      contentMd:
        "Now give a hint. Use `if` / `elif` / `else` to print `Too low`, `Too high`, or `Correct!`.\n\nTest: secret is `7`, player guesses **4** → **Too low**.",
      starterCode:
        'secret = 7\nguess = int(input())\nif guess < secret:\n    print("Too low")\nelif guess > secret:\n    print()\nelse:\n    print("Correct!")\n',
      solutionCode:
        'secret = 7\nguess = int(input())\nif guess < secret:\n    print("Too low")\nelif guess > secret:\n    print("Too high")\nelse:\n    print("Correct!")',
      testsJson: stdout("Too low", ["4"]),
      hintsJson: ['The elif line should be print("Too high")'],
      xpReward: 25,
    },
    {
      order: 4,
      type: "code",
      title: "Keep guessing",
      contentMd:
        "Wrap it in a `while` loop so the player keeps going until they're right. Print `Nope` for each wrong guess, and `You got it!` at the end.\n\nTest: guesses are **3**, then **9**, then **7** → `Nope`, `Nope`, `You got it!`",
      starterCode:
        'secret = 7\nguess = 0\nwhile guess != secret:\n    guess = int(input())\n    if guess != secret:\n        print("Nope")\nprint()\n',
      solutionCode:
        'secret = 7\nguess = 0\nwhile guess != secret:\n    guess = int(input())\n    if guess != secret:\n        print("Nope")\nprint("You got it!")',
      testsJson: stdout("Nope\nNope\nYou got it!", ["3", "9", "7"]),
      hintsJson: [
        '!= means "is not equal to".',
        'The last line should be print("You got it!")',
      ],
      xpReward: 35,
    },
    {
      order: 5,
      type: "teach",
      title: "Make it yours",
      contentMd:
        "You've built a real game! Now change it:\n\n- Make the secret **random**: add `import random` at the top and `secret = random.randint(1, 20)`.\n- **Count** the guesses and tell the player their score.\n- Turn it into a **quiz game** instead, with your own questions.\n\nWhen you're happy, put your hand up and show the class. 🎉",
      xpReward: 10,
    },
  ],
};

// ---------------------------------------------------------------------------

export const LESSONS: SeedLesson[] = [
  WEEK_1,
  WEEK_2,
  WEEK_3,
  WEEK_4,
  WEEK_5,
  WEEK_6,
  WEEK_7,
  WEEK_8,
];
