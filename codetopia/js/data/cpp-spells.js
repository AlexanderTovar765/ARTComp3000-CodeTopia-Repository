/* C++ track: every spell, with the console output it prints. */

"use strict";

const CPP_SP = [];
/* cs(level, action, concepts, title, code, goal, out, extra). $w $x $y words, $n $m numbers (n > m), $c a capital letter. out is text or a function of those values. */
const cs = (L, a, c, t, code, goal, out, o) => CPP_SP.push(Object.assign({ id:++spId, L, a, c:[].concat(c), t, code, goal, out }, o || {}));
const seq = (a, b, s = 1) => { const r = []; for (let i = a; s > 0 ? i <= b : i >= b; i += s) r.push(i); return r; };
const CFIX = "Fix the enemy's broken spell so it compiles and prints the right thing.";

/* level 1: printing */
cs(1,"attack",["cout","str","semi"],"Print",R`cout << "$w!";`,"Print “$w!” to the console",M => M.w + "!");
cs(1,"attack",["cout","str"],"Two parts",R`cout << "$w " << "$x";`,"Print $w, a space, then $x, using two << arrows",M => M.w + " " + M.x);
cs(1,"attack",["cout","endl"],"End the line",R`cout << "$w" << endl;`,"Print “$w”, then end the line with endl",M => M.w);
cs(1,"attack",["cout","endl"],"Line break",R`cout << "$w\n$x";`,"Print $w and $x on two lines, using \\n inside the quotes",M => M.w + "\n" + M.x);
cs(1,"attack",["cout","semi"],"Two statements",R`cout << "$w ";
cout << "$x";`,"Use two cout statements to print $w, a space, then $x on one line",M => M.w + " " + M.x);
cs(1,"attack",["cout","endl"],"Two lines",R`cout << "$w" << endl;
cout << "$x";`,"Print $w and end the line with endl, then print $x on the next line",M => M.w + "\n" + M.x);
cs(1,"attack","cmt","Comment",R`// $w
cout << "$x";`,"Write a comment that says $w, then print “$x”",M => M.x);
cs(1,"attack",["main","cout"],"Main function",R`int main() {
  cout << "$w!";
  return 0;
}`,"Write main so it prints “$w!” and then returns 0",M => M.w + "!");
/* level 2: variables and types */
cs(2,"heavy",["var","types"],"Whole number",R`int score = $n;
cout << score;`,"Make an int called score equal to $n, then print it",M => M.n);
cs(2,"heavy",["var","types"],"Decimal",R`double price = $n.5;
cout << price;`,"Make a double called price equal to $n.5, then print it",M => M.n + ".5");
cs(2,"heavy",["var","string"],"Text variable",R`string name = "$w";
cout << name;`,"Make a string called name holding “$w”, then print it",M => M.w);
cs(2,"heavy",["types","string"],"Single letter",R`char grade = '$c';
cout << grade;`,"Make a char called grade holding the letter $c, then print it",M => M.c);
cs(2,"heavy","types","True or false",R`bool alive = true;
cout << alive;`,"Make a bool called alive set to true, then print it. A true bool prints as 1",() => "1");
cs(2,"heavy","assign","New value",R`int hp = $n;
hp = $m;
cout << hp;`,"Make an int hp equal to $n, change it to $m, then print it",M => M.m);
cs(2,"heavy","var","Two variables",R`int a = $n;
int b = $m;
cout << a << " " << b;`,"Make ints a = $n and b = $m, then print them with a space between",M => M.n + " " + M.m);
cs(2,"heavy",["var","cout"],"Label and value",R`int gold = $n;
cout << "Gold: " << gold;`,"Make an int gold equal to $n, then print Gold: and the variable",M => "Gold: " + M.n);
cs(2,"attack",["string","cout"],"Greeting",R`string name = "$w";
cout << "Hi " << name;`,"Make a string called name holding “$w”, then print Hi and the name",M => "Hi " + M.w);
/* level 3: operators and input */
cs(3,"attack","arith","Add",R`cout << $n + $m;`,"Print $n plus $m",M => M.n + M.m);
cs(3,"attack","arith","Subtract",R`cout << $n - $m;`,"Print $n minus $m",M => M.n - M.m);
cs(3,"attack","arith","Multiply",R`cout << $n * $m;`,"Print $n times $m",M => M.n * M.m);
cs(3,"attack","arith","Brackets first",R`cout << ($n + $m) * 2;`,"Print ($n plus $m) times 2, with the sum in brackets",M => (M.n + M.m) * 2);
cs(3,"attack","divmod","Whole division",R`cout << $n / $m;`,"Print $n divided by $m. Whole numbers drop the remainder",M => Math.floor(M.n / M.m));
cs(3,"attack","divmod","Remainder",R`cout << $n % $m;`,"Print the remainder of $n divided by $m",M => M.n % M.m);
cs(3,"heavy","compound","Add to it",R`int xp = $n;
xp += $m;
cout << xp;`,"Make an int xp equal to $n, add $m with +=, then print it",M => M.n + M.m);
cs(3,"heavy","compound","Count up",R`int level = $m;
level++;
cout << level;`,"Make an int level equal to $m, add one with ++, then print it",M => M.m + 1);
cs(3,"heavy",["arith","var"],"Variables in maths",R`int a = $n;
int b = $m;
cout << a * b;`,"Make ints a = $n and b = $m, then print a times b",M => M.n * M.m);
cs(3,"heavy","cin","Ask for a number",R`int age;
cin >> age;
cout << age + 1;`,"Make an int age, read it with cin, then print age plus 1",M => "You type: " + M.n + "\n" + (M.n + 1));
cs(3,"heavy",["cin","string"],"Ask for a name",R`string name;
cin >> name;
cout << "Hi " << name;`,"Make a string name, read it with cin, then print Hi and the name",M => "You type: " + M.w + "\nHi " + M.w);
/* level 4: decisions */
cs(4,"attack",["if","cmp"],"If",R`int hp = $n;
if (hp > $m) {
  cout << "$w";
}`,"Make an int hp equal to $n. If hp is greater than $m, print “$w”",M => M.w);
cs(4,"attack",["if","cmp"],"Equal",R`int hp = $n;
if (hp == $n) {
  cout << "$w";
}`,"Make an int hp equal to $n. If hp equals $n, print “$w”",M => M.w);
cs(4,"attack",["if","else"],"Else",R`int hp = $m;
if (hp > $n) {
  cout << "$w";
} else {
  cout << "$x";
}`,"Make an int hp equal to $m. If hp is greater than $n print “$w”, otherwise print “$x”",M => M.x);
cs(4,"heavy","cmp","Not equal",R`int hp = $n;
if (hp != $m) {
  cout << "$w";
}`,"Make an int hp equal to $n. If hp is not equal to $m, print “$w”",M => M.w);
cs(4,"heavy",["if","else"],"Else if",R`int hp = $m;
if (hp > $n) {
  cout << "$w";
} else if (hp == $m) {
  cout << "$x";
} else {
  cout << "$y";
}`,"Make an int hp equal to $m. If hp is over $n print “$w”, else if hp equals $m print “$x”, else print “$y”",M => M.x);
cs(4,"heavy","logic","Both",R`int hp = $m;
if (hp > 0 && hp < $n) {
  cout << "$w";
}`,"Make an int hp equal to $m. If hp is above 0 and also below $n, print “$w”",M => M.w);
cs(4,"heavy","logic","Either",R`bool key = false;
bool door = true;
if (key || door) {
  cout << "$w";
}`,"Make bools key (false) and door (true). If key or door, print “$w”",M => M.w);
cs(4,"heavy","logic","Flip",R`bool alive = false;
if (!alive) {
  cout << "$w";
}`,"Make a bool alive set to false. If not alive, print “$w”",M => M.w);
cs(4,"block",["if","cmp"],"Guard",R`if ($n > $m) {
  cout << "$w";
}`,"If $n is greater than $m, print “$w”",M => M.w);
cs(4,"block",["if","else"],"Choice",R`if ($m > $n) {
  cout << "$w";
} else {
  cout << "$x";
}`,"If $m is greater than $n print “$w”, otherwise print “$x”",M => M.x);
cs(4,"block","cmp","Fix: one equals",R`int hp = $n;
if (hp == $n) {
  cout << "$w";
}`,CFIX,M => M.w,{ bug:R`int hp = $n;
if (hp = $n) {
  cout << "$w";
}` });
cs(4,"block","if","Fix: no brackets",R`if ($n > $m) {
  cout << "$w";
}`,CFIX,M => M.w,{ bug:R`if $n > $m {
  cout << "$w";
}` });
cs(4,"block",["semi","var"],"Fix: missing semicolon",R`int hp = $n;
cout << hp;`,CFIX,M => M.n,{ bug:R`int hp = $n
cout << hp;` });
/* level 5: loops */
cs(5,"attack","while","Count with while",R`int i = 1;
while (i <= $m) {
  cout << i << " ";
  i++;
}`,"Count from 1 to $m with a while loop, printing each number and a space",M => seq(1, M.m).join(" "));
cs(5,"attack","for","Count with for",R`for (int i = 0; i < $m; i++) {
  cout << i << " ";
}`,"Use a for loop to print the numbers from 0 up to $m minus 1, each followed by a space",M => seq(0, M.m - 1).join(" "));
cs(5,"attack","for","Repeat a word",R`for (int i = 0; i < 3; i++) {
  cout << "$w ";
}`,"Use a for loop to print $w three times, each followed by a space",M => [M.w, M.w, M.w].join(" "));
cs(5,"heavy","for","Step by two",R`for (int i = 0; i < $n; i += 2) {
  cout << i << " ";
}`,"Use a for loop that counts from 0 below $n in steps of 2, printing each number and a space",M => seq(0, M.n - 1, 2).join(" "));
cs(5,"heavy",["for","compound"],"Add them up",R`int sum = 0;
for (int i = 1; i <= $m; i++) {
  sum += i;
}
cout << sum;`,"Add up 1 to $m in an int called sum with a for loop, then print sum",M => M.m * (M.m + 1) / 2);
cs(5,"heavy","for","Count down",R`for (int i = $m; i > 0; i--) {
  cout << i << " ";
}`,"Use a for loop to count down from $m to 1, printing each number and a space",M => seq(M.m, 1, -1).join(" "));
cs(5,"heavy",["nloop","for"],"Star box",R`for (int r = 0; r < 2; r++) {
  for (int c = 0; c < $m; c++) {
    cout << "*";
  }
  cout << endl;
}`,"Print 2 rows of $m stars with a loop inside a loop, ending each row with endl",M => "*".repeat(M.m) + "\n" + "*".repeat(M.m));
cs(5,"block","brk","Stop early",R`for (int i = 1; i <= $n; i++) {
  if (i == $m) {
    break;
  }
  cout << i << " ";
}`,"Loop i from 1 to $n, printing i and a space, but break when i equals $m",M => seq(1, M.m - 1).join(" "));
cs(5,"block","brk","Skip one",R`for (int i = 1; i <= $n; i++) {
  if (i == $m) {
    continue;
  }
  cout << i << " ";
}`,"Loop i from 1 to $n, printing i and a space, but continue past $m",M => seq(1, M.n).filter(v => v !== M.m).join(" "));
cs(5,"block","while","Fix: endless loop",R`int i = 0;
while (i < $m) {
  cout << i << " ";
  i++;
}`,CFIX,M => seq(0, M.m - 1).join(" "),{ bug:R`int i = 0;
while (i < $m) {
  cout << i << " ";
}` });
cs(5,"block","for","Fix: commas in for",R`for (int i = 0; i < $m; i++) {
  cout << i << " ";
}`,CFIX,M => seq(0, M.m - 1).join(" "),{ bug:R`for (int i = 0, i < $m, i++) {
  cout << i << " ";
}` });
/* level 6: functions */
cs(6,"attack","func","Say hello",R`void greet() {
  cout << "$w";
}
greet();`,"Write a void function greet that prints “$w”, then call it",M => M.w);
cs(6,"attack","func","Call twice",R`void greet() {
  cout << "$w ";
}
greet();
greet();`,"Write a void function greet that prints $w and a space, then call it twice",M => M.w + " " + M.w);
cs(6,"heavy","param","Parameter",R`void shout(string s) {
  cout << s << "!";
}
shout("$w");`,"Write a void function shout with a string parameter s that prints s and !, then call shout with “$w”",M => M.w + "!");
cs(6,"heavy","param","Two parameters",R`void add(int a, int b) {
  cout << a + b;
}
add($n, $m);`,"Write a void function add that takes ints a and b and prints their sum, then call add($n, $m)",M => M.n + M.m);
cs(6,"heavy","ret","Return a value",R`int twice(int x) {
  return x * 2;
}
cout << twice($n);`,"Write an int function twice that returns x times 2, then print twice($n)",M => M.n * 2);
cs(6,"heavy",["ret","var"],"Return and store",R`int add(int a, int b) {
  return a + b;
}
int total = add($n, $m);
cout << total;`,"Write an int function add that returns a plus b, store add($n, $m) in an int total, then print it",M => M.n + M.m);
cs(6,"heavy","ret","True or false",R`bool isBig(int x) {
  return x > $m;
}
cout << isBig($n);`,"Write a bool function isBig that returns whether x is greater than $m, then print isBig($n)",() => "1");
cs(6,"heavy",["ret","if"],"Pick a word",R`string grade(int s) {
  if (s >= $m) {
    return "$w";
  }
  return "$x";
}
cout << grade($n);`,"Write a string function grade that returns “$w” when s is at least $m, otherwise “$x”, then print grade($n)",M => M.w);
cs(6,"block","ret","Guard function",R`bool alive(int hp) {
  return hp > 0;
}
cout << alive($n);`,"Write a bool function alive that returns whether hp is above 0, then print alive($n)",() => "1");
cs(6,"block","ret","Fix: no return type",R`int twice(int x) {
  return x * 2;
}
cout << twice($n);`,CFIX,M => M.n * 2,{ bug:R`twice(int x) {
  return x * 2;
}
cout << twice($n);` });
cs(6,"block","func","Fix: forgot the brackets",R`void greet() {
  cout << "$w";
}
greet();`,CFIX,M => M.w,{ bug:R`void greet() {
  cout << "$w";
}
greet;` });
cs(6,"block","param","Fix: missing parameter type",R`void shout(string s) {
  cout << s << "!";
}
shout("$w");`,CFIX,M => M.w + "!",{ bug:R`void shout(s) {
  cout << s << "!";
}
shout("$w");` });
/* level 7: arrays and vectors */
cs(7,"attack","arr","First item",R`int a[3] = {$n, $m, 1};
cout << a[0];`,"Make an int array a of 3 items holding $n, $m and 1, then print the first item",M => M.n);
cs(7,"attack","arr","Last item",R`int a[3] = {$m, 4, $n};
cout << a[2];`,"Make an int array a of 3 items holding $m, 4 and $n, then print the last item",M => M.n);
cs(7,"attack","arr","Change an item",R`int a[2] = {$n, $m};
a[0] = 1;
cout << a[0];`,"Make an int array a of 2 items holding $n and $m, set the first item to 1, then print it",() => "1");
cs(7,"heavy",["arr","for"],"Loop an array",R`int a[3] = {$m, $n, 1};
for (int i = 0; i < 3; i++) {
  cout << a[i] << " ";
}`,"Make an int array a holding $m, $n and 1, then loop over it printing each item and a space",M => [M.m, M.n, 1].join(" "));
cs(7,"heavy","vec","Vector",R`vector<int> v = {$n, $m};
cout << v[1];`,"Make a vector of ints v holding $n and $m, then print the second item",M => M.m);
cs(7,"heavy","vec","Push back",R`vector<int> v;
v.push_back($n);
v.push_back($m);
cout << v.size();`,"Make an empty vector of ints v, push_back $n and $m, then print its size",() => "2");
cs(7,"heavy","rfor","Range for",R`vector<int> v = {$m, $n};
for (int x : v) {
  cout << x << " ";
}`,"Make a vector of ints v holding $m and $n, then print each item and a space with a range-based for",M => M.m + " " + M.n);
cs(7,"heavy",["rfor","compound"],"Sum a vector",R`vector<int> v = {$m, $n, 1};
int sum = 0;
for (int x : v) {
  sum += x;
}
cout << sum;`,"Make a vector of ints v holding $m, $n and 1, add the items into an int sum with a range-based for, then print sum",M => M.m + M.n + 1);
cs(7,"item","vec","Potion bag",R`vector<string> bag = {"$w", "$x"};
cout << bag[0];`,"Make a vector of strings bag holding “$w” and “$x”, then print the first item",M => M.w,{ name:"Potion" });
cs(7,"item","vec","Bag size",R`vector<string> bag;
bag.push_back("$w");
cout << bag.size();`,"Make an empty vector of strings bag, push_back “$w”, then print its size",() => "1",{ name:"Big potion" });
cs(7,"item","rfor","Loop the bag",R`vector<string> bag = {"$w", "$x"};
for (string s : bag) {
  cout << s << " ";
}`,"Make a vector of strings bag holding “$w” and “$x”, then print each item and a space with a range-based for",M => M.w + " " + M.x,{ name:"Scroll", fx:{ heal:18, shield:.5 } });
cs(7,"block","arr","Fix: past the end",R`int a[3] = {$n, $m, 1};
cout << a[2];`,CFIX,() => "1",{ bug:R`int a[3] = {$n, $m, 1};
cout << a[3];` });
cs(7,"block","vec","Fix: missing comma",R`vector<int> v = {$n, $m};
cout << v.size();`,CFIX,() => "2",{ bug:R`vector<int> v = {$n $m};
cout << v.size();` });
/* level 8: strings */
cs(8,"attack","slen","Length",R`string s = "$w";
cout << s.length();`,"Make a string s holding “$w”, then print its length",M => M.w.length);
cs(8,"attack","slen","First letter",R`string s = "$w";
cout << s[0];`,"Make a string s holding “$w”, then print its first letter",M => M.w[0]);
cs(8,"attack","sadd","Join",R`string a = "$w";
string b = "$x";
cout << a + b;`,"Make strings a = “$w” and b = “$x”, then print them joined together",M => M.w + M.x);
cs(8,"heavy","sadd","Join with a space",R`string a = "$w";
string b = "$x";
cout << a + " " + b;`,"Make strings a = “$w” and b = “$x”, then print a, a space, then b, joined with +",M => M.w + " " + M.x);
cs(8,"heavy","sadd","Append",R`string s = "$w";
s += "$x";
cout << s;`,"Make a string s holding “$w”, add “$x” to the end with +=, then print s",M => M.w + M.x);
cs(8,"heavy","smeth","Cut a piece",R`string s = "$w";
cout << s.substr(0, 2);`,"Make a string s holding “$w”, then print its first 2 letters with substr",M => M.w.slice(0, 2));
cs(8,"heavy","slen","Last letter",R`string s = "$w";
cout << s[s.length() - 1];`,"Make a string s holding “$w”, then print its last letter using length() minus 1",M => M.w.slice(-1));
cs(8,"heavy",["rfor","slen"],"Spell it out",R`string s = "$w";
for (char c : s) {
  cout << c << "-";
}`,"Make a string s holding “$w”, then print each char followed by a dash with a range-based for",M => M.w.split("").join("-") + "-");
cs(8,"heavy","smeth","Is it empty",R`string s = "";
cout << s.empty();`,"Make an empty string s, then print whether it is empty. True prints as 1",() => "1");
cs(8,"item","sadd","Name tag",R`string name = "$w";
cout << "Hi " << name << "!";`,"Make a string name holding “$w”, then print Hi, the name, and !",M => "Hi " + M.w + "!",{ name:"Potion" });
cs(8,"item","sadd","Shout",R`string s = "$w";
s += "!";
cout << s;`,"Make a string s holding “$w”, add ! to the end, then print s",M => M.w + "!",{ name:"Big potion" });
cs(8,"item",["slen","cout"],"Scroll of size",R`string s = "$w";
cout << s.length() << " " << s;`,"Make a string s holding “$w”, then print its length, a space, and the string",M => M.w.length + " " + M.w,{ name:"Scroll", fx:{ heal:18, shield:.5 } });
cs(8,"block","string","Fix: single quotes",R`string s = "$w";
cout << s;`,CFIX,M => M.w,{ bug:R`string s = '$w';
cout << s;` });
cs(8,"block","string","Fix: no quotes",R`string s = "$w";
cout << s;`,CFIX,M => M.w,{ bug:R`string s = $w;
cout << s;` });
cs(8,"block","sadd","Fix: two literals",R`string a = "$w";
cout << a + "$x";`,CFIX,M => M.w + M.x,{ bug:R`cout << "$w" + "$x";` });
/* level 9: references and pointers */
cs(9,"attack","ref","Reference",R`int hp = $n;
int& r = hp;
r = $m;
cout << hp;`,"Make an int hp equal to $n and a reference r to it, set r to $m, then print hp",M => M.m);
cs(9,"attack",["addr","ptr"],"Address of",R`int hp = $n;
int* p = &hp;
cout << *p;`,"Make an int hp equal to $n and a pointer p to it, then print the value p points at",M => M.n);
cs(9,"heavy","ptr","Change through a pointer",R`int hp = $n;
int* p = &hp;
*p = $m;
cout << hp;`,"Make an int hp equal to $n and a pointer p to it, set the pointed-at value to $m, then print hp",M => M.m);
cs(9,"heavy","ptr","Pointer shortcut",R`int hp = $n;
int* p = &hp;
*p += 1;
cout << hp;`,"Make an int hp equal to $n and a pointer p to it, add 1 through the pointer, then print hp",M => M.n + 1);
cs(9,"heavy",["ref","func"],"Pass by reference",R`void heal(int& hp) {
  hp += $m;
}
int hp = $n;
heal(hp);
cout << hp;`,"Write a void function heal that adds $m to an int reference hp, then make hp = $n, call heal and print hp",M => M.n + M.m);
cs(9,"heavy",["ref","func"],"Pass a copy",R`void heal(int hp) {
  hp += $m;
}
int hp = $n;
heal(hp);
cout << hp;`,"Write a void function heal that adds $m to a copied int hp, then make hp = $n, call heal and print hp. The original does not change",M => M.n);
cs(9,"heavy",["ptr","if"],"Null pointer",R`int* p = nullptr;
if (p == nullptr) {
  cout << "$w";
}`,"Make an int pointer p set to nullptr. If p equals nullptr, print “$w”",M => M.w);
cs(9,"heavy","new","New",R`int* p = new int($n);
cout << *p;
delete p;`,"Make a pointer p to a new int holding $n, print the value, then delete p",M => M.n);
cs(9,"heavy",["new","ptr"],"New, then set",R`int* p = new int;
*p = $n;
cout << *p;
delete p;`,"Make a pointer p to a new int, set the value to $n, print it, then delete p",M => M.n);
cs(9,"item",["ptr","addr"],"Two views",R`int hp = $n;
int* p = &hp;
cout << *p << " " << hp;`,"Make an int hp equal to $n and a pointer p to it, then print *p, a space, and hp",M => M.n + " " + M.n,{ name:"Potion" });
cs(9,"item",["ptr","arr"],"Array pointer",R`int a[2] = {$n, $m};
int* p = a;
cout << *p;`,"Make an int array a holding $n and $m and a pointer p to it, then print the value p points at",M => M.n,{ name:"Scroll", fx:{ heal:18, shield:.5 } });
cs(9,"block",["ptr","if"],"Safe check",R`int* p = nullptr;
if (p == nullptr) {
  cout << "$w";
}`,"Make an int pointer p set to nullptr. If p equals nullptr, print “$w”",M => M.w);
cs(9,"block","ptr","Fix: print the address",R`int hp = $n;
int* p = &hp;
cout << *p;`,CFIX,M => M.n,{ bug:R`int hp = $n;
int* p = &hp;
cout << p;` });
cs(9,"block","addr","Fix: forgot &",R`int hp = $n;
int* p = &hp;
cout << *p;`,CFIX,M => M.n,{ bug:R`int hp = $n;
int* p = hp;
cout << *p;` });
cs(9,"block","new","Fix: memory leak",R`int* p = new int($n);
cout << *p;
delete p;`,CFIX,M => M.n,{ bug:R`int* p = new int($n);
cout << *p;` });
/* level 10: structs and classes */
cs(10,"attack","struct","Struct",R`struct Hero {
  int hp;
};
Hero h;
h.hp = $n;
cout << h.hp;`,"Write a struct Hero with an int hp, make a Hero h, set its hp to $n, then print it",M => M.n);
cs(10,"attack","struct","Struct with two members",R`struct Pet {
  string name;
  int age;
};
Pet p = {"$w", $n};
cout << p.name;`,"Write a struct Pet with a string name and an int age, make Pet p holding “$w” and $n, then print its name",M => M.w);
cs(10,"heavy","class","Class",R`class Hero {
public:
  int hp;
};
Hero h;
h.hp = $n;
cout << h.hp;`,"Write a class Hero with a public int hp, make a Hero h, set its hp to $n, then print it",M => M.n);
cs(10,"heavy","method","Method",R`class Hero {
public:
  void shout() {
    cout << "$w";
  }
};
Hero h;
h.shout();`,"Write a class Hero with a public method shout that prints “$w”, make a Hero h and call shout",M => M.w);
cs(10,"heavy","ctor","Constructor",R`class Hero {
public:
  int hp;
  Hero(int h) {
    hp = h;
  }
};
Hero a($n);
cout << a.hp;`,"Write a class Hero with a public int hp and a constructor that sets it from a parameter h, make Hero a($n), then print a.hp",M => M.n);
cs(10,"heavy","method","Method that changes data",R`class Hero {
public:
  int hp = $n;
  void hurt() {
    hp -= $m;
  }
};
Hero h;
h.hurt();
cout << h.hp;`,"Write a class Hero with a public int hp = $n and a method hurt that subtracts $m, make a Hero h, call hurt, then print hp",M => M.n - M.m);
cs(10,"heavy",["class","new","ptr"],"Object pointer",R`class Hero {
public:
  int hp = $n;
};
Hero* h = new Hero();
cout << h->hp;
delete h;`,"Write a class Hero with a public int hp = $n, make a pointer h to a new Hero, print h->hp, then delete h",M => M.n);
cs(10,"heavy",["class","method"],"Private data",R`class Hero {
private:
  int hp = $n;
public:
  int getHp() {
    return hp;
  }
};
Hero h;
cout << h.getHp();`,"Write a class Hero with a private int hp = $n and a public method getHp that returns it, make a Hero h, then print h.getHp()",M => M.n);
cs(10,"item",["class","method"],"Healing method",R`class Hero {
public:
  int hp = $m;
  void heal() {
    hp += $m;
  }
};
Hero h;
h.heal();
cout << h.hp;`,"Write a class Hero with a public int hp = $m and a method heal that adds $m, make a Hero h, call heal, then print hp",M => M.m * 2,{ name:"Elixir", fx:{ heal:24, shield:.5 } });
cs(10,"item",["struct","vec"],"Party list",R`struct Hero {
  string name;
};
vector<Hero> party;
party.push_back({"$w"});
cout << party[0].name;`,"Write a struct Hero with a string name, make a vector of Hero called party, push_back one Hero named “$w”, then print the first name",M => M.w,{ name:"Scroll", fx:{ heal:18, shield:.5 } });
cs(10,"block","struct","Fix: missing semicolon",R`struct Hero {
  int hp;
};
Hero h;
h.hp = $n;
cout << h.hp;`,CFIX,M => M.n,{ bug:R`struct Hero {
  int hp;
}
Hero h;
h.hp = $n;
cout << h.hp;` });
cs(10,"block","class","Fix: not public",R`class Hero {
public:
  int hp;
};
Hero h;
h.hp = $n;
cout << h.hp;`,CFIX,M => M.n,{ bug:R`class Hero {
  int hp;
};
Hero h;
h.hp = $n;
cout << h.hp;` });
cs(10,"block",["class","new"],"Fix: arrow on a pointer",R`class Hero {
public:
  int hp = $n;
};
Hero* h = new Hero();
cout << h->hp;
delete h;`,CFIX,M => M.n,{ bug:R`class Hero {
public:
  int hp = $n;
};
Hero* h = new Hero();
cout << h.hp;
delete h;` });
cs(10,"block",["class","method"],"Fix: method call",R`class Hero {
public:
  void shout() {
    cout << "$w";
  }
};
Hero h;
h.shout();`,CFIX,M => M.w,{ bug:R`class Hero {
public:
  void shout() {
    cout << "$w";
  }
};
Hero h;
shout();` });
