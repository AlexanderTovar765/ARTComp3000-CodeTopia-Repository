/* C++ track: the concepts the player learns (CPP_CON). */

"use strict";

/* ================= curriculum: C++ track ================= */
const R = String.raw;
const CPP_CON = {
  cout:{n:"Printing with cout",L:1,tags:["cout <<"],e:"cout prints to the console. The << arrows point from your text into cout."},
  semi:{n:"Semicolons",L:1,tags:[";"],e:"Every statement ends with a semicolon. It is the full stop of C++."},
  str:{n:"Text in quotes",L:1,tags:['"text"'],e:"Text is written inside double quotes. Without quotes, C++ thinks you mean a name."},
  endl:{n:"New lines",L:1,tags:["endl","\\n"],e:"endl or \\n moves the cursor to a new line, like pressing Enter."},
  cmt:{n:"Comments",L:1,tags:["//"],e:"// starts a comment. C++ ignores everything after it on that line, so it is a note for humans."},
  main:{n:"The main function",L:1,tags:["int main()"],e:"Every C++ program starts at main. The code between { } runs top to bottom, and return 0 says it finished fine."},
  var:{n:"Variables",L:2,tags:["int x = 5;"],e:"A variable is a named box. You give its type, its name and a starting value."},
  types:{n:"Types",L:2,tags:["int","double","bool","char"],e:"A type says what a variable holds: int for whole numbers, double for decimals, bool for true or false, char for one letter."},
  string:{n:"Strings and chars",L:2,tags:["string","char"],e:"string holds text and uses double quotes. char holds a single character and uses single quotes."},
  assign:{n:"Changing a value",L:2,tags:["x = 7;"],e:"After a variable exists, = stores a new value in it. You do not repeat the type."},
  arith:{n:"Arithmetic",L:3,tags:["+","-","*"],e:"C++ does maths with + - * and /. Brackets go first, then * and /, then + and -."},
  divmod:{n:"Integer division and %",L:3,tags:["/","%"],e:"Dividing two ints throws the remainder away, so 7 / 2 is 3. % gives the remainder, so 7 % 2 is 1."},
  compound:{n:"Shortcuts",L:3,tags:["+=","++"],e:"x += 3 means x = x + 3. x++ adds one."},
  cin:{n:"Input with cin",L:3,tags:["cin >>"],e:"cin reads what the player types. The >> arrows point from cin into your variable."},
  if:{n:"if",L:4,tags:["if (...) { }"],e:"if runs its block only when the condition inside ( ) is true."},
  else:{n:"else",L:4,tags:["else"],e:"else runs when the if condition was false. else if tries another condition."},
  cmp:{n:"Comparisons",L:4,tags:["==","!=","<",">"],e:"Compare with == (equal), != (not equal), <, >, <= and >=. A single = stores a value, it does not compare."},
  logic:{n:"&&, || and !",L:4,tags:["&&","||","!"],e:"&& means both must be true, || means either one, and ! flips true and false."},
  while:{n:"while loops",L:5,tags:["while"],e:"while repeats its block as long as the condition stays true. Something inside must change it, or it never stops."},
  for:{n:"for loops",L:5,tags:["for (...;...;...)"],e:"A for loop packs start, condition and step on one line: for (int i = 0; i < 5; i++)."},
  brk:{n:"break and continue",L:5,tags:["break","continue"],e:"break leaves the loop at once. continue skips to the next round."},
  nloop:{n:"Loops in loops",L:5,tags:["for in for"],e:"A loop inside a loop runs its whole inner loop on every round of the outer one. Think rows and columns."},
  func:{n:"Functions",L:6,tags:["void f() { }"],e:"A function is a named block of code you can call again and again. void means it gives nothing back."},
  param:{n:"Parameters",L:6,tags:["int a"],e:"Parameters are a function's inputs. Each has a type and a name, and you pass values in when you call it."},
  ret:{n:"Return values",L:6,tags:["return"],e:"A function can hand a value back with return. Its type goes in front of the name instead of void."},
  arr:{n:"Arrays",L:7,tags:["int a[3]"],e:"An array holds several values of one type in a row. Counting starts at 0, so a[0] is the first item."},
  vec:{n:"Vectors",L:7,tags:["vector<int>"],e:"A vector is an array that can grow. push_back adds to the end and size() says how many items it holds."},
  rfor:{n:"Range-based for",L:7,tags:["for (int x : v)"],e:"for (int x : list) visits each item in turn, with no index to manage."},
  slen:{n:"Length and index",L:8,tags:[".length()","s[0]"],e:"length() counts the characters in a string. s[0] is the first character, and the last is s[s.length() - 1]."},
  sadd:{n:"Joining strings",L:8,tags:["+","+="],e:"+ joins two strings and += adds to the end of one. At least one side must be a string variable, not just quotes."},
  smeth:{n:"String helpers",L:8,tags:[".substr()",".empty()"],e:"substr(start, count) cuts a piece out of a string. empty() says whether it has no characters."},
  ref:{n:"References",L:9,tags:["int& r"],e:"A reference is another name for the same variable. Change one and the other changes. Passing by reference lets a function change your variable."},
  addr:{n:"Addresses",L:9,tags:["&x"],e:"Putting & in front of a variable gives its address, the place in memory where it lives."},
  ptr:{n:"Pointers",L:9,tags:["int* p","*p"],e:"A pointer stores an address. *p follows it to the value it points at. nullptr means it points at nothing."},
  new:{n:"new and delete",L:9,tags:["new","delete"],e:"new makes a value in memory and gives you a pointer to it. delete gives the memory back. Forget it and you leak memory."},
  struct:{n:"Structs",L:10,tags:["struct"],e:"A struct bundles related variables into one type. Use a dot to reach a member, like h.hp. A struct ends with }; and the semicolon matters."},
  class:{n:"Classes",L:10,tags:["class","public:"],e:"A class bundles data and functions. Members after public: can be used from outside the class."},
  ctor:{n:"Constructors",L:10,tags:["Hero(int h)"],e:"A constructor has the same name as its class and runs when an object is made, setting up its members."},
  method:{n:"Methods",L:10,tags:["h.shout()"],e:"A function inside a class is a method. Call it on an object with a dot. Through a pointer, use -> instead."}
};
