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
  /** Set for optional bonus challenges shown after the core lesson. */
  challengeTier?: "easy" | "hard";
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

function chal(
  tier: "easy" | "hard",
  title: string,
  contentMd: string,
  opts: {
    starterCode?: string;
    solutionCode: string;
    tests: unknown[];
    hints?: string[];
  },
): SeedStep {
  return {
    order: tier === "easy" ? 90 : 91,
    type: "code",
    title,
    contentMd,
    starterCode: opts.starterCode,
    solutionCode: opts.solutionCode,
    testsJson: opts.tests,
    hintsJson: opts.hints ?? [],
    xpReward: tier === "easy" ? 25 : 50,
    challengeTier: tier,
  };
}

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
      type: "teach",
      title: "Comments — notes for humans",
      contentMd:
        "Sometimes we want to leave a note in our code that Python **ignores**. Start a line with `#` and Python skips it completely:\n\n```python\n# This line is just a note\nprint(\"Hello!\")\n```\n\nProgrammers use comments to explain what tricky bits of code do — you've already seen them in the starter code!",
      xpReward: 5,
    },
    {
      order: 4,
      type: "quiz",
      title: "Spot the comment",
      contentMd: "Which of these lines is a comment (Python ignores it)?",
      testsJson: choice("A", [
        "# this explains the code",
        'print("hi")',
        'name = "Sam"',
      ]),
      xpReward: 15,
    },
    {
      order: 5,
      type: "code",
      title: "Two lines",
      contentMd:
        "Print exactly these two lines:\n\n```\nHi!\nI am learning Python.\n```",
      starterCode: "# type two print lines\n",
      solutionCode: 'print("Hi!")\nprint("I am learning Python.")',
      testsJson: stdout("Hi!\nI am learning Python."),
      hintsJson: [
        "You need two separate print() lines.",
        'print("Hi!") then print("I am learning Python.")',
      ],
      xpReward: 20,
    },
    {
      order: 6,
      type: "quiz",
      title: "Which line is right?",
      contentMd: "Which line prints the word **cat**?",
      testsJson: choice("B", ["print(cat)", 'print("cat")', "say cat"]),
      xpReward: 20,
    },
    {
      order: 7,
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
      order: 8,
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
    {
      order: 9,
      type: "code",
      title: "Put it all together",
      contentMd:
        "Time for your own mini intro! Print exactly these three lines (copy them carefully, including the apostrophe):\n\n```\nMy name is Coder.\nI am learning Python.\nLet's code!\n```",
      starterCode: "# your three lines here\n",
      solutionCode:
        'print("My name is Coder.")\nprint("I am learning Python.")\nprint("Let\'s code!")',
      testsJson: stdout("My name is Coder.\nI am learning Python.\nLet's code!"),
      hintsJson: [
        "Three print() lines, one per line of text.",
        "The apostrophe in Let's is fine inside double quotes — no extra work needed.",
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
      type: "teach",
      title: "Naming your boxes",
      contentMd:
        "Variable names have a few rules:\n\n- No spaces — use `highScore`, not `high score`\n- Can't start with a number — `2fast` is not allowed\n- Letters, numbers and `_` only\n\nGood names describe what's inside the box: `score`, `playerName`, `livesLeft`.",
      xpReward: 5,
    },
    {
      order: 4,
      type: "quiz",
      title: "Which is a good variable name?",
      contentMd: "Which of these is allowed as a variable name in Python?",
      testsJson: choice("C", ["2fast", "high score", "highScore"]),
      xpReward: 15,
    },
    {
      order: 5,
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
      order: 6,
      type: "quiz",
      title: "Spot the variable",
      contentMd: "Which line makes a variable called `score`?",
      testsJson: choice("B", ["print(score)", "score = 10", "10 = score"]),
      xpReward: 15,
    },
    {
      order: 7,
      type: "predict",
      title: "Changing a box",
      contentMd: "A variable can be changed. What does this print?",
      solutionCode: "x = 2\nx = 9\nprint(x)",
      testsJson: text("9"),
      hintsJson: ["The second line replaces what's in the box."],
      xpReward: 15,
    },
    {
      order: 8,
      type: "code",
      title: "Weather report",
      contentMd:
        "Ask for a **place**, then a **weather word**, and print `It is <weather> in <place>.`\n\nTest: `Bristol` then `sunny` → **It is sunny in Bristol.**",
      starterCode: "place = input()\nweather = input()\n\nprint()\n",
      solutionCode:
        'place = input()\nweather = input()\nprint("It is " + weather + " in " + place + ".")',
      testsJson: stdout("It is sunny in Bristol.", ["Bristol", "sunny"]),
      hintsJson: [
        "Join the pieces with + — remember the spaces and the full stop.",
        'print("It is " + weather + " in " + place + ".")',
      ],
      xpReward: 25,
    },
    {
      order: 9,
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
    {
      order: 10,
      type: "code",
      title: "Put it all together",
      contentMd:
        "Ask for a **name**, then a **hobby**, and print `<name> loves <hobby>!`\n\nTest: `Sam` then `football` → **Sam loves football!**",
      starterCode: "name = input()\nhobby = input()\n\nprint()\n",
      solutionCode:
        'name = input()\nhobby = input()\nprint(name + " loves " + hobby + "!")',
      testsJson: stdout("Sam loves football!", ["Sam", "football"]),
      hintsJson: [
        "Three pieces joined with +: name, \" loves \", hobby, and \"!\"",
        'print(name + " loves " + hobby + "!")',
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
      type: "teach",
      title: "Remainders with %",
      contentMd:
        "`%` gives you the **leftover** after dividing:\n\n```python\nprint(10 % 3)   # 1  (3 goes into 10 three times, 1 left over)\nprint(8 % 2)    # 0  (2 goes in exactly, nothing left over)\n```\n\nA remainder of 0 means the first number divides **exactly**.",
      xpReward: 5,
    },
    {
      order: 4,
      type: "quiz",
      title: "What does 10 % 3 give?",
      contentMd: "What does `10 % 3` give?",
      testsJson: choice("B", ["3", "1", "0"]),
      xpReward: 15,
    },
    {
      order: 5,
      type: "quiz",
      title: "Whole-number divide",
      contentMd:
        "`//` divides and throws away the leftover. What does `7 // 2` give?",
      testsJson: choice("B", ["3.5", "3", "1"]),
      xpReward: 15,
    },
    {
      order: 6,
      type: "predict",
      title: "Which sum happens first?",
      contentMd: "Python does `*` before `+`, just like in maths. What prints?",
      solutionCode: "print(2 + 3 * 4)",
      testsJson: text("14"),
      hintsJson: ["Do 3 * 4 first, then add 2."],
      xpReward: 15,
    },
    {
      order: 7,
      type: "predict",
      title: "Order with subtraction",
      contentMd: "Same rule with subtraction. What prints?",
      solutionCode: "print(10 - 2 * 3)",
      testsJson: text("4"),
      hintsJson: ["2 * 3 happens first, then subtract from 10."],
      xpReward: 15,
    },
    {
      order: 8,
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
      order: 9,
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
    {
      order: 10,
      type: "code",
      title: "Rectangle area",
      contentMd:
        "Ask for a **width**, then a **height** (whole numbers), and print the area (width times height).\n\nTest: `4` then `5` → **20**",
      starterCode: "width = int(input())\nheight = int(input())\n\nprint()\n",
      solutionCode:
        "width = int(input())\nheight = int(input())\nprint(width * height)",
      testsJson: stdout("20", ["4", "5"]),
      hintsJson: ["Area = width * height.", "print(width * height)"],
      xpReward: 25,
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
      type: "quiz",
      title: "Not equal to",
      contentMd: "Which symbol means **“is NOT equal to”**?",
      testsJson: choice("A", ["!=", "==", "<>"]),
      xpReward: 15,
    },
    {
      order: 5,
      type: "teach",
      title: "Combining checks with and / or",
      contentMd:
        "You can check more than one thing at once:\n\n```python\nage = 15\nif age >= 13 and age < 20:\n    print(\"teenager\")\n```\n\n`and` needs **both** sides to be true. `or` needs **at least one** side to be true.",
      xpReward: 5,
    },
    {
      order: 6,
      type: "code",
      title: "Between two numbers",
      contentMd:
        "Ask for a number. If it is **1 to 10** (inclusive), print `in range`. Otherwise print `out of range`.\n\nTest: player types **5** → **in range**.",
      starterCode:
        'n = int(input())\nif n >= 1 and n <= 10:\n    print()\nelse:\n    print("out of range")\n',
      solutionCode:
        'n = int(input())\nif n >= 1 and n <= 10:\n    print("in range")\nelse:\n    print("out of range")',
      testsJson: stdout("in range", ["5"]),
      hintsJson: [
        "Both n >= 1 and n <= 10 need to be true.",
        'Fill in: print("in range")',
      ],
      xpReward: 25,
    },
    {
      order: 7,
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
      order: 8,
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
      order: 9,
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
    {
      order: 10,
      type: "code",
      title: "Grade calculator",
      contentMd:
        "Ask for a score out of 100 and print a grade: `A` for 90+, `B` for 70+, `C` for 50+, otherwise `D`.\n\nTest: player types **82** → **B**",
      starterCode:
        'score = int(input())\nif score >= 90:\n    print("A")\nelif score >= 70:\n    print()\nelif score >= 50:\n    print("C")\nelse:\n    print("D")\n',
      solutionCode:
        'score = int(input())\nif score >= 90:\n    print("A")\nelif score >= 70:\n    print("B")\nelif score >= 50:\n    print("C")\nelse:\n    print("D")',
      testsJson: stdout("B", ["82"]),
      hintsJson: [
        "Check the biggest number first, then work down.",
        'Fill in: print("B")',
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
      type: "teach",
      title: "Stepping through a range",
      contentMd:
        "`range()` can take a **step** too — a third number saying how far to jump each time:\n\n```python\nfor i in range(0, 10, 2):\n    print(i)   # 0, 2, 4, 6, 8\n```\n\nThat counts up in **2s**.",
      xpReward: 5,
    },
    {
      order: 5,
      type: "code",
      title: "Even numbers",
      contentMd:
        "Use a loop with a step of 2 to print the even numbers **2 to 10**, each on its own line.",
      starterCode: "for i in range(2, 11, 2):\n    print()\n",
      solutionCode: "for i in range(2, 11, 2):\n    print(i)",
      testsJson: stdout("2\n4\n6\n8\n10"),
      hintsJson: [
        "range(2, 11, 2) counts 2, 4, 6, 8, 10.",
        "Print the loop variable: print(i)",
      ],
      xpReward: 25,
    },
    {
      order: 6,
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
      order: 7,
      type: "predict",
      title: "Tracing a while loop",
      contentMd: "What does this print, line by line?",
      solutionCode: "n = 1\nwhile n < 4:\n    print(n)\n    n = n + 1",
      testsJson: text("1\n2\n3"),
      hintsJson: ["It stops as soon as n is no longer less than 4."],
      xpReward: 20,
    },
    {
      order: 8,
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
      order: 9,
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
    {
      order: 10,
      type: "code",
      title: "Times table",
      contentMd:
        "Ask for a number, then print its **times table from 1 to 5**, like:\n\n```\n3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n```\n\nTest: player types **3** → the table above.",
      starterCode:
        'n = int(input())\nfor i in range(1, 6):\n    print()\n',
      solutionCode:
        'n = int(input())\nfor i in range(1, 6):\n    print(str(n) + " x " + str(i) + " = " + str(n * i))',
      testsJson: stdout(
        "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15",
        ["3"],
      ),
      hintsJson: [
        "str() turns a number into text so you can join it with +.",
        'print(str(n) + " x " + str(i) + " = " + str(n * i))',
      ],
      xpReward: 35,
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
        "Make a list with square brackets:\n\n```python\nfruits = [\"apple\", \"pear\", \"plum\"]\n```\n\nPick an item by its **position**, starting at **0**:\n\n```python\nprint(fruits[0])   # apple\nprint(fruits[2])   # plum\n```",
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
      type: "teach",
      title: "How many items?",
      contentMd:
        "`len()` tells you how many items are in a list:\n\n```python\nfruits = [\"apple\", \"pear\", \"plum\"]\nprint(len(fruits))   # 3\n```",
      xpReward: 5,
    },
    {
      order: 5,
      type: "code",
      title: "Count the list",
      contentMd: "Print how many scores are in this list.",
      starterCode: "scores = [10, 20, 30, 40]\nprint()\n",
      solutionCode: "scores = [10, 20, 30, 40]\nprint(len(scores))",
      testsJson: stdout("4"),
      hintsJson: ["print(len(scores))"],
      xpReward: 20,
    },
    {
      order: 6,
      type: "predict",
      title: "Loop over a list",
      contentMd: "A `for` loop can go through each item. What does this print?",
      solutionCode: 'for c in ["red", "green", "blue"]:\n    print(c)',
      testsJson: text("red\ngreen\nblue"),
      hintsJson: ["One line per item, in order."],
      xpReward: 15,
    },
    {
      order: 7,
      type: "code",
      title: "Change an item",
      contentMd:
        "You can change one item using its position. Change position `1` of `pets` to **hamster**, then print the whole list. It should print `['dog', 'hamster', 'fish']`.",
      starterCode: 'pets = ["dog", "cat", "fish"]\n\nprint(pets)\n',
      solutionCode:
        'pets = ["dog", "cat", "fish"]\npets[1] = "hamster"\nprint(pets)',
      testsJson: stdout("['dog', 'hamster', 'fish']"),
      hintsJson: ['pets[1] = "hamster"'],
      xpReward: 25,
    },
    {
      order: 8,
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
      order: 9,
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
    {
      order: 10,
      type: "code",
      title: "Shopping list total",
      contentMd:
        "Loop through this list of prices and print the **total**.",
      starterCode: "prices = [2, 5, 3]\ntotal = 0\n\nprint(total)\n",
      solutionCode:
        "prices = [2, 5, 3]\ntotal = 0\nfor p in prices:\n    total = total + p\nprint(total)",
      testsJson: stdout("10"),
      hintsJson: [
        "Loop through prices, adding each one to total.",
        "for p in prices:\\n    total = total + p",
      ],
      xpReward: 30,
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
      type: "teach",
      title: "A function that just prints",
      contentMd:
        "Not every function needs `return`. Some just **do** something, like printing:\n\n```python\ndef shout(word):\n    print(word.upper())\n\nshout(\"go\")   # GO\n```\n\n`.upper()` turns text into CAPITALS. This function doesn't give anything back — it just runs when you call it.",
      xpReward: 5,
    },
    {
      order: 4,
      type: "code",
      title: "Say it twice",
      contentMd:
        "Finish `repeat_word` so it **prints** the word twice, separated by a space (no `return` needed). Then call `repeat_word(\"go\")`.",
      starterCode:
        'def repeat_word(word):\n    print()\n\nrepeat_word("go")\n',
      solutionCode:
        'def repeat_word(word):\n    print(word, word)\n\nrepeat_word("go")',
      testsJson: stdout("go go"),
      hintsJson: ["print(word, word) prints it twice with a space between."],
      xpReward: 25,
    },
    {
      order: 5,
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
      order: 6,
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
      order: 7,
      type: "predict",
      title: "A function calling a function",
      contentMd: "Functions can use other functions. What prints?",
      solutionCode:
        "def double(n):\n    return n * 2\n\ndef quadruple(n):\n    return double(double(n))\n\nprint(quadruple(3))",
      testsJson: text("12"),
      hintsJson: ["double(3) is 6, then double(6) is 12."],
      xpReward: 20,
    },
    {
      order: 8,
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
      order: 9,
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
    {
      order: 10,
      type: "code",
      title: "Temperature converter",
      contentMd:
        "Write a function `to_f(c)` that converts Celsius to Fahrenheit: `f = c * 9 / 5 + 32`. Ask for a temperature, convert it, and print it as a whole number.\n\nTest: player types **20** → **68**",
      starterCode:
        "def to_f(c):\n    return \n\nc = int(input())\nprint(int(to_f(c)))\n",
      solutionCode:
        "def to_f(c):\n    return c * 9 / 5 + 32\n\nc = int(input())\nprint(int(to_f(c)))",
      testsJson: stdout("68", ["20"]),
      hintsJson: [
        "return c * 9 / 5 + 32",
        "int() at the end chops off the .0 so it prints as a whole number.",
      ],
      xpReward: 35,
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
      type: "predict",
      title: "Before we code it",
      contentMd: "Let's check the logic first. What does this print?",
      solutionCode:
        'secret = 5\nguess = 3\nif guess == secret:\n    print("Correct!")\nelse:\n    print("Try again")',
      testsJson: text("Try again"),
      hintsJson: ["3 does not equal 5."],
      xpReward: 15,
    },
    {
      order: 3,
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
      order: 4,
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
      order: 5,
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
      order: 6,
      type: "code",
      title: "Play again?",
      contentMd:
        "After the player wins, ask **Play again? (yes/no)**. If they type `yes`, print `Great, go again!`, otherwise print `Thanks for playing!`\n\nTest: guesses **3**, **9**, **7**, then answer **no** → `Nope`, `Nope`, `You got it!`, `Thanks for playing!`",
      starterCode:
        'secret = 7\nguess = 0\nwhile guess != secret:\n    guess = int(input())\n    if guess != secret:\n        print("Nope")\nprint("You got it!")\nagain = input()\nif again == "yes":\n    print("Great, go again!")\nelse:\n    print()\n',
      solutionCode:
        'secret = 7\nguess = 0\nwhile guess != secret:\n    guess = int(input())\n    if guess != secret:\n        print("Nope")\nprint("You got it!")\nagain = input()\nif again == "yes":\n    print("Great, go again!")\nelse:\n    print("Thanks for playing!")',
      testsJson: stdout("Nope\nNope\nYou got it!\nThanks for playing!", [
        "3",
        "9",
        "7",
        "no",
      ]),
      hintsJson: [
        "This builds on the game you already wrote — just add the question at the end.",
        'Fill in the else: print("Thanks for playing!")',
      ],
      xpReward: 30,
    },
    {
      order: 7,
      type: "teach",
      title: "Make it yours",
      contentMd:
        "You've built a real game! Now change it:\n\n- Make the secret **random**: add `import random` at the top and `secret = random.randint(1, 20)`.\n- **Count** the guesses and tell the player their score.\n- Turn it into a **quiz game** instead, with your own questions.\n\nWhen you're happy, put your hand up and show the class. 🎉",
      xpReward: 10,
    },
  ],
};

// ---------------------------------------------------------------------------
// Bonus challenges — optional, for kids who reach the end before the rest.
// They don't count toward lesson completion or the Perfect Week badge.

const CHALLENGES: Record<number, SeedStep[]> = {
  1: [
    chal(
      "easy",
      "Build a pyramid",
      "Print this shape exactly, using three `print()` lines:\n\n```\n*\n**\n***\n```",
      {
        solutionCode: 'print("*")\nprint("**")\nprint("***")',
        tests: stdout("*\n**\n***"),
        hints: ["One print() per row.", 'Row 2 is print("**")'],
      },
    ),
    chal(
      "hard",
      "Draw a box",
      "Print this box exactly:\n\n```\n+---+\n|   |\n+---+\n```",
      {
        solutionCode: 'print("+---+")\nprint("|   |")\nprint("+---+")',
        tests: stdout("+---+\n|   |\n+---+"),
        hints: [
          "Three print lines again.",
          'The middle line is a | then 3 spaces then a |',
        ],
      },
    ),
  ],
  2: [
    chal(
      "easy",
      "Colour + animal",
      "Ask for a **colour**, then an **animal**, then print `The <colour> <animal>`.\n\nTest: `blue` then `cat` → **The blue cat**",
      {
        starterCode: "colour = input()\nanimal = input()\n\nprint()\n",
        solutionCode: 'colour = input()\nanimal = input()\nprint("The", colour, animal)',
        tests: stdout("The blue cat", ["blue", "cat"]),
        hints: ['print("The", colour, animal)'],
      },
    ),
    chal(
      "hard",
      "Name banner",
      "Ask for a name and print a banner around it:\n\n```\n*********\nHi Sam!\n*********\n```\n\nTest: `Sam` → the banner above.",
      {
        starterCode: "name = input()\n",
        solutionCode:
          'name = input()\nprint("*********")\nprint("Hi " + name + "!")\nprint("*********")',
        tests: stdout("*********\nHi Sam!\n*********", ["Sam"]),
        hints: [
          "The star lines are always the same — 9 stars.",
          'Middle line: "Hi " + name + "!"',
        ],
      },
    ),
  ],
  3: [
    chal(
      "easy",
      "Minutes to seconds",
      "Ask for a number of minutes and print how many **seconds** that is.\n\nTest: `5` → **300**",
      {
        starterCode: "mins = int(input())\n\nprint()\n",
        solutionCode: "mins = int(input())\nprint(mins * 60)",
        tests: stdout("300", ["5"]),
        hints: ["60 seconds in a minute.", "print(mins * 60)"],
      },
    ),
    chal(
      "hard",
      "Total and difference",
      "Ask for two numbers on separate lines. Print their **total**, then the **first minus the second**, each on its own line.\n\nTest: `10` then `4` → `14` then `6`",
      {
        starterCode: "a = int(input())\nb = int(input())\n",
        solutionCode:
          "a = int(input())\nb = int(input())\nprint(a + b)\nprint(a - b)",
        tests: stdout("14\n6", ["10", "4"]),
        hints: ["Two print lines: a + b, then a - b."],
      },
    ),
  ],
  4: [
    chal(
      "easy",
      "Child, teen or adult",
      "Ask for an age. Print `child` if it is under 13, `teen` if 13 to 19, otherwise `adult`.\n\nTest: `15` → **teen**",
      {
        starterCode:
          'age = int(input())\nif age < 13:\n    print("child")\nelif age <= 19:\n    print()\nelse:\n    print("adult")\n',
        solutionCode:
          'age = int(input())\nif age < 13:\n    print("child")\nelif age <= 19:\n    print("teen")\nelse:\n    print("adult")',
        tests: stdout("teen", ["15"]),
        hints: ['Fill the elif line: print("teen")'],
      },
    ),
    chal(
      "hard",
      "Rock, paper, scissors judge",
      "Ask for **Player 1**'s choice, then **Player 2**'s (`rock`, `paper` or `scissors`). Print `Player 1 wins`, `Player 2 wins` or `Draw`.\n\nTest: `rock` then `scissors` → **Player 1 wins**",
      {
        starterCode:
          'p1 = input()\np2 = input()\n\nif p1 == p2:\n    print("Draw")\n',
        solutionCode:
          'p1 = input()\np2 = input()\nif p1 == p2:\n    print("Draw")\nelif (p1 == "rock" and p2 == "scissors") or (p1 == "paper" and p2 == "rock") or (p1 == "scissors" and p2 == "paper"):\n    print("Player 1 wins")\nelse:\n    print("Player 2 wins")',
        tests: stdout("Player 1 wins", ["rock", "scissors"]),
        hints: [
          "Rock beats scissors, paper beats rock, scissors beats paper.",
          "Check all three winning cases for Player 1 with `or`.",
        ],
      },
    ),
  ],
  5: [
    chal(
      "easy",
      "Five times table",
      "Use a loop to print the 5 times table: `5`, `10`, `15` … up to `50`, each on its own line.",
      {
        starterCode: "for i in range(1, 11):\n    print()\n",
        solutionCode: "for i in range(1, 11):\n    print(i * 5)",
        tests: stdout("5\n10\n15\n20\n25\n30\n35\n40\n45\n50"),
        hints: ["range(1, 11) gives 1..10.", "print(i * 5)"],
      },
    ),
    chal(
      "hard",
      "Number triangle",
      "Print this triangle using a loop inside a loop:\n\n```\n1\n12\n123\n1234\n12345\n```",
      {
        starterCode:
          'for row in range(1, 6):\n    line = ""\n    for n in range(1, row + 1):\n        line = line + str(n)\n    print(line)\n',
        solutionCode:
          'for row in range(1, 6):\n    line = ""\n    for n in range(1, row + 1):\n        line = line + str(n)\n    print(line)',
        tests: stdout("1\n12\n123\n1234\n12345"),
        hints: [
          "Build each line as a string, then print it.",
          "The inner loop goes from 1 to row.",
        ],
      },
    ),
  ],
  6: [
    chal(
      "easy",
      "Count and last",
      "A list is given. Print **how many** items it has, then print the **last** item.\n\nExpected: `6` then `42`",
      {
        starterCode: "nums = [4, 8, 15, 16, 23, 42]\n",
        solutionCode:
          "nums = [4, 8, 15, 16, 23, 42]\nprint(len(nums))\nprint(nums[-1])",
        tests: stdout("6\n42"),
        hints: ["len(nums) counts them.", "nums[-1] is the last one."],
      },
    ),
    chal(
      "hard",
      "Numbered list",
      "A list of names is given. Print each one with a number in front:\n\n```\n1. Sam\n2. Alex\n3. Jo\n```",
      {
        starterCode:
          'names = ["Sam", "Alex", "Jo"]\ncount = 1\nfor name in names:\n    print()\n    count = count + 1\n',
        solutionCode:
          'names = ["Sam", "Alex", "Jo"]\ncount = 1\nfor name in names:\n    print(str(count) + ". " + name)\n    count = count + 1',
        tests: stdout("1. Sam\n2. Alex\n3. Jo"),
        hints: [
          "Keep a counter that grows each time round the loop.",
          'print(str(count) + ". " + name)',
        ],
      },
    ),
  ],
  7: [
    chal(
      "easy",
      "Square it",
      "Write a function `square(n)` that returns `n` times `n`. Then print `square(6)`.",
      {
        starterCode: "def square(n):\n    return \n\nprint(square(6))\n",
        solutionCode: "def square(n):\n    return n * n\n\nprint(square(6))",
        tests: stdout("36"),
        hints: ["return n * n"],
      },
    ),
    chal(
      "hard",
      "Even or odd",
      "Write a function `even(n)` that returns `yes` if `n` is even and `no` if it is odd. Print `even(4)` then `even(7)`.\n\nExpected: `yes` then `no`\n\n(Hint: `n % 2` is 0 for even numbers.)",
      {
        starterCode:
          'def even(n):\n    if n % 2 == 0:\n        return \n    else:\n        return "no"\n\nprint(even(4))\nprint(even(7))\n',
        solutionCode:
          'def even(n):\n    if n % 2 == 0:\n        return "yes"\n    else:\n        return "no"\n\nprint(even(4))\nprint(even(7))',
        tests: stdout("yes\nno"),
        hints: ['Fill in: return "yes"'],
      },
    ),
  ],
  8: [
    chal(
      "easy",
      "Count the guesses",
      "Add a guess counter to the game. Print `Nope` for each wrong guess, and at the end `You took N guesses`.\n\nTest: guesses `3`, `9`, `7` (secret is 7) → `Nope`, `Nope`, `You took 3 guesses`",
      {
        starterCode:
          'secret = 7\nguess = 0\ntries = 0\nwhile guess != secret:\n    guess = int(input())\n    tries = tries + 1\n    if guess != secret:\n        print("Nope")\nprint()\n',
        solutionCode:
          'secret = 7\nguess = 0\ntries = 0\nwhile guess != secret:\n    guess = int(input())\n    tries = tries + 1\n    if guess != secret:\n        print("Nope")\nprint("You took " + str(tries) + " guesses")',
        tests: stdout("Nope\nNope\nYou took 3 guesses", ["3", "9", "7"]),
        hints: [
          "Add 1 to tries every time round the loop.",
          'Last line: print("You took " + str(tries) + " guesses")',
        ],
      },
    ),
    chal(
      "hard",
      "Two-question quiz",
      "Make a mini quiz. Ask **“What colour is the sky?”** then **“What is 2 + 2?”**. Add 1 to the score for each right answer (`blue` and `4`). Print `You scored X out of 2`.\n\nTest: answers `blue` then `4` → **You scored 2 out of 2**",
      {
        starterCode:
          'score = 0\na1 = input()\nif a1 == "blue":\n    score = score + 1\na2 = input()\nif a2 == "4":\n    score = score + 1\nprint()\n',
        solutionCode:
          'score = 0\na1 = input()\nif a1 == "blue":\n    score = score + 1\na2 = input()\nif a2 == "4":\n    score = score + 1\nprint("You scored " + str(score) + " out of 2")',
        tests: stdout("You scored 2 out of 2", ["blue", "4"]),
        hints: [
          "One if per question, adding to score.",
          'print("You scored " + str(score) + " out of 2")',
        ],
      },
    ),
  ],
};

const BASE_LESSONS: SeedLesson[] = [
  WEEK_1,
  WEEK_2,
  WEEK_3,
  WEEK_4,
  WEEK_5,
  WEEK_6,
  WEEK_7,
  WEEK_8,
];

export const LESSONS: SeedLesson[] = BASE_LESSONS.map((l) => ({
  ...l,
  steps: [...l.steps, ...(CHALLENGES[l.weekNo] ?? [])],
}));
