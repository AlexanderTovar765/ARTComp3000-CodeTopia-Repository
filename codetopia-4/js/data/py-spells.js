/* Python track: every spell, with the console output it prints. Also builds the borrowed spells for the final fight. */

"use strict";

const PY_SP = [];
/* p(level, action, concepts, title, lines, goal, out, extra). $w $x $y words, $n $m numbers (n > m), $c a capital letter.
   out is text or a function of those values. Code is an array of lines. extra.bug is the enemy's broken version. */
const p = (L, a, c, t, code, goal, out, o) => PY_SP.push(Object.assign({ id:++spId, L, a, c:[].concat(c), t, code:[].concat(code).join("\n"), goal, out }, o || {}));
const pb = (bug, o) => Object.assign({ bug:[].concat(bug).join("\n") }, o || {});
const PFIX = "Fix the enemy's broken spell so it runs and prints the right thing.";

/* ---------- level 1: printing ---------- */
p(1,"attack",["print","str"],"Print",'print("$w!")',"Print “$w!” to the console","$w!");
p(1,"attack",["print","str"],"Two words",'print("$w $x")',"Print $w, a space, then $x, all in one string","$w $x");
p(1,"attack",["print","order"],"Two prints",['print("$w")','print("$x")'],"Print $w on one line and $x on the next, using two print calls","$w\n$x");
p(1,"attack",["print","args"],"Two values",'print("$w", "$x")',"Print $w and $x with one print, separating the two values with a comma","$w $x");
p(1,"attack",["print","num"],"A number",'print($n)',"Print the number $n, with no quotes",M => M.n);
p(1,"attack",["print","num"],"Sum",'print($n + $m)',"Print the sum of $n and $m",M => M.n + M.m);
p(1,"attack",["str","esc"],"New line",'print("$w\\n$x")',"Print $w and $x on two lines, using \\n inside the quotes","$w\n$x");
p(1,"attack","cmt","Comment",['# $w','print("$x")'],"Write a comment that says $w, then print “$x”","$x");
p(1,"attack",["pend","print"],"Same line",['print("$w", end="")','print("$x")'],"Print $w without ending the line, using end=\"\", then print $x so they share a line","$w$x");
p(1,"attack","str","Single quotes","print('$w!')","Print “$w!” using single quotes instead of double quotes","$w!");

p(1,"heavy",["print","order"],"Three prints",['print("$w")','print("$x")','print("$y")'],"Print $w, $x and $y on three lines, using three print calls","$w\n$x\n$y");
p(1,"heavy",["cmt","print"],"Comment and two prints",['# $w','print("$x")','print("$y")'],"Write a comment that says $w, then print $x and $y on two lines","$x\n$y");
p(1,"heavy",["print","num"],"Word and sum",['print("$w")','print($n + $m)'],"Print $w, then on the next line print the sum of $n and $m",M => M.w + "\n" + (M.n + M.m));
p(1,"heavy",["print","args","num"],"Words and a number",['print("$w", "$x")','print($n)'],"Print $w and $x with one print and a comma, then print the number $n on the next line",M => M.w + " " + M.x + "\n" + M.n);

/* ---------- level 2: variables and types ---------- */
p(2,"attack",["var","num"],"A variable",['score = $n','print(score)'],"Make a variable called score equal to $n, then print it",M => M.n);
p(2,"attack",["var","str"],"Text variable",['hero = "$w"','print(hero)'],"Make a variable called hero holding “$w”, then print it","$w");
p(2,"attack",["var","types"],"A boolean",['ready = True','print(ready)'],"Make a variable called ready equal to True, then print it","True");
p(2,"attack","var","Two variables",['a = $n','b = $m','print(a, b)'],"Make a equal to $n and b equal to $m, then print both with one print",M => M.n + " " + M.m);
p(2,"attack","assign","Change it",['hp = $n','hp = $m','print(hp)'],"Make hp equal to $n, change it to $m, then print it",M => M.m);
p(2,"heavy",["type","types"],"Type of a number",['hp = $n','print(type(hp))'],"Make hp equal to $n, then print its type with type()","<class 'int'>");
p(2,"heavy",["type","types"],"Type of text",['name = "$w"','print(type(name))'],"Make name hold “$w”, then print its type with type()","<class 'str'>");
p(2,"heavy",["type","types"],"Type of a decimal",['price = $n.5','print(type(price))'],"Make price equal to $n.5, then print its type with type()","<class 'float'>");
p(2,"heavy",["type","types"],"Type of a boolean",['alive = True','print(type(alive))'],"Make alive equal to True, then print its type with type()","<class 'bool'>");
p(2,"heavy","naming","Snake case",['hero_name = "$w"','print(hero_name)'],"Make a variable called hero_name (snake_case) holding “$w”, then print it","$w");
p(2,"heavy","assign","Add to a value",['gold = $n','gold = gold + $m','print(gold)'],"Make gold equal to $n, set it to gold + $m, then print it",M => M.n + M.m);
p(2,"heavy","none","Nothing yet",['loot = None','print(loot)'],"Make loot equal to None, then print it","None");
p(2,"heavy",["conv","types"],"Text to number",['total = int("$n") + $m','print(total)'],"Turn the text “$n” into a number with int(), add $m, and print the total",M => M.n + M.m);
p(2,"heavy","conv","Number to text",['print(str($n) + "$w")'],"Turn $n into text with str(), join it to “$w” with +, and print it",M => M.n + M.w);
p(2,"heavy","multi","Several at once",['a, b = $n, $m','print(b, a)'],"Make a and b equal to $n and $m in one line, then print b and a",M => M.m + " " + M.n);

/* ---------- level 3: operators and strings ---------- */
p(3,"attack","arith","Multiply",'print($n * $m)',"Print $n multiplied by $m",M => M.n * M.m);
p(3,"attack","arith","Subtract",'print($n - $m)',"Print $m taken away from $n",M => M.n - M.m);
p(3,"attack","arith","Divide",'print(10 / 4)',"Print 10 divided by 4, and see that / gives a decimal","2.5");
p(3,"attack","floor","Floor division",'print($n // $m)',"Print $n divided by $m with the decimal part thrown away, using //",M => Math.floor(M.n / M.m));
p(3,"attack","mod","Remainder",'print($n % $m)',"Print the remainder of $n divided by $m, using %",M => M.n % M.m);
p(3,"attack","concat","Join words",'print("$w" + "$x")',"Join “$w” and “$x” with +, with no space, and print it","$w$x");
p(3,"attack","concat","Join with a space",'print("$w" + " " + "$x")',"Join “$w”, a space and “$x” with +, and print it","$w $x");
p(3,"heavy","pow","Power",'print($m ** 2)',"Print $m squared, using **",M => M.m ** 2);
p(3,"heavy","aug","Add and store",['gold = $n','gold += $m','print(gold)'],"Make gold equal to $n, add $m with +=, then print it",M => M.n + M.m);
p(3,"heavy","aug","Take away and store",['hp = $n','hp -= $m','print(hp)'],"Make hp equal to $n, take $m away with -=, then print it",M => M.n - M.m);
p(3,"heavy","repeat","Repeat",'print("$w" * 3)',"Print “$w” repeated 3 times with *, with no spaces","$w$w$w");
p(3,"heavy","fstr","f-string",['name = "$w"','print(f"Hello {name}!")'],"Make name hold “$w”, then print Hello, the name and ! with an f-string","Hello $w!");
p(3,"heavy",["fstr","arith"],"f-string sum",['hp = $n','print(f"HP: {hp + $m}")'],"Make hp equal to $n, then print HP: and hp plus $m with an f-string",M => "HP: " + (M.n + M.m));
p(3,"heavy","strlen","How long",'print(len("$w"))',"Print the length of the string “$w”",M => M.w.length);
p(3,"heavy","strmeth","Shout",'print("$w".upper())',"Print “$w” in capital letters, using .upper()",M => M.w.toUpperCase());
p(3,"heavy","strmeth","Whisper",'print("$w".lower())',"Print “$w” in small letters, using .lower()",M => M.w.toLowerCase());
p(3,"heavy","slice","First letter",'print("$w"[0])',"Print the first letter of “$w”, using the index 0",M => M.w[0]);
p(3,"heavy","slice","First letters",'print("$w"[0:3])',"Print the first 3 letters of “$w”, using [0:3]",M => M.w.slice(0, 3));
p(3,"heavy",["repeat","num"],"A line",'print("-" * $n)',"Print a dash repeated $n times, using *",M => "-".repeat(M.n));

/* ---------- level 4: decisions ---------- */
p(4,"attack",["if","indent"],"If",['if $n > $m:','    print("$w")'],"If $n is greater than $m, print “$w”","$w");
p(4,"attack",["if","else"],"If and else",['if $m > $n:','    print("$w")','else:','    print("$x")'],"If $m is greater than $n print “$w”, otherwise print “$x”","$x");
p(4,"attack","cmp","Equal",['hp = $n','print(hp == $n)'],"Make hp equal to $n, then print whether hp == $n","True");
p(4,"attack","cmp","Not equal",'print($n != $m)',"Print whether $n != $m","True");
p(4,"heavy","elif","Elif",['hp = $m','if hp > $n:','    print("high")','elif hp > 0:','    print("$w")','else:','    print("low")'],"Make hp equal to $m, then use if, elif and else to print high when hp is over $n, “$w” when it is over 0, and low otherwise","$w");
p(4,"heavy","logic","And",['hp = $n','if hp > $m and hp < 10:','    print("$w")'],"Make hp equal to $n, then if hp is over $m and under 10, print “$w”","$w");
p(4,"heavy","logic","Or",['hp = $n','if hp < 0 or hp > $m:','    print("$w")'],"Make hp equal to $n, then if hp is under 0 or over $m, print “$w”","$w");
p(4,"heavy","logic","Not",['dead = False','if not dead:','    print("$w")'],"Make dead equal to False, then if not dead, print “$w”","$w");
p(4,"heavy","inop","In a string",['if "a" in "$w":','    print("$x")','else:','    print("none")'],"If the letter a is in “$w”, print “$x”, otherwise print none",M => M.w.includes("a") ? M.x : "none");
p(4,"heavy","ternary","One-line if",['hp = $n','print("$w" if hp > $m else "$x")'],"Make hp equal to $n, then print “$w” if hp is over $m and “$x” if not, using a one-line if","$w");
p(4,"heavy","truthy","Truthy text",['if "$w":','    print("$x")'],"If the text “$w” is truthy, print “$x”","$x");
p(4,"block",["if","cmp"],"Guard",['hp = $n','if hp > $m:','    print("$w")'],"Make hp equal to $n, then if hp is over $m, print “$w”","$w");
p(4,"block",["if","else"],"Choice",['hp = $m','if hp > $n:','    print("$w")','else:','    print("$x")'],"Make hp equal to $m, then print “$w” if it is over $n, otherwise print “$x”","$x");
p(4,"block","if","Fix: missing colon",['hp = $n','if hp > $m:','    print("$w")'],PFIX,"$w",pb(['hp = $n','if hp > $m','    print("$w")']));
p(4,"block","cmp","Fix: one equals",['hp = $n','if hp == $n:','    print("$w")'],PFIX,"$w",pb(['hp = $n','if hp = $n:','    print("$w")']));
p(4,"block","elif","Fix: else if",['hp = $m','if hp > $n:','    print("$w")','elif hp > 0:','    print("$x")'],PFIX,"$x",pb(['hp = $m','if hp > $n:','    print("$w")','else if hp > 0:','    print("$x")']));
p(4,"block","types","Fix: lowercase true",['ready = True','if ready:','    print("$w")'],PFIX,"$w",pb(['ready = true','if ready:','    print("$w")']));
p(4,"block","logic","Fix: symbols",['hp = $n','if hp > $m and hp < 10:','    print("$w")'],PFIX,"$w",pb(['hp = $n','if hp > $m && hp < 10:','    print("$w")']));
p(4,"block","print","Fix: missing bracket",['if $n > $m:','    print("$w")'],PFIX,"$w",pb(['if $n > $m:','    print("$w"']));

/* ---------- level 5: loops ---------- */
p(5,"attack","for","Count with for",['for i in range(1, 4):','    print(i)'],"Use a for loop with range(1, 4) to print the numbers 1 to 3","1\n2\n3");
p(5,"attack","for","Repeat a word",['for i in range(3):','    print("$w")'],"Use a for loop with range(3) to print “$w” 3 times","$w\n$w\n$w");
p(5,"attack","while","Count with while",['i = 1','while i <= 3:','    print(i)','    i += 1'],"Make i equal to 1, then use while to print i and add one to it, as long as i is 3 or less","1\n2\n3");
p(5,"heavy","for","Count down",['for i in range(3, 0, -1):','    print(i)'],"Use range(3, 0, -1) to count down from 3 to 1","3\n2\n1");
p(5,"heavy","for","Count by two",['for i in range(0, 7, 2):','    print(i)'],"Use range(0, 7, 2) to print 0, 2, 4 and 6","0\n2\n4\n6");
p(5,"heavy",["accum","for"],"Add them up",['total = 0','for i in range(1, 5):','    total += i','print(total)'],"Make total equal to 0, add 1 to 4 to it in a for loop, then print total","10");
p(5,"heavy","brk","Break",['for i in range(1, 10):','    if i == $m:','        break','    print(i)'],"Loop i from 1 to 9 and print it, but break when i is $m",M => Array.from({ length:M.m - 1 }, (_, k) => k + 1).join("\n"));
p(5,"heavy","brk","Continue",['for i in range(1, 5):','    if i == 2:','        continue','    print(i)'],"Loop i from 1 to 4 and print it, but skip 2 with continue","1\n3\n4");
p(5,"heavy","forin","Letters",['for ch in "$w":','    print(ch)'],"Use a for loop to print every letter of “$w” on its own line",M => M.w.split("").join("\n"));
p(5,"heavy",["while","accum"],"Doubling",['power = 1','while power < 20:','    power *= 2','print(power)'],"Make power equal to 1, double it with *= while it is under 20, then print it","32");
p(5,"heavy","for","Times table",['for i in range(1, 4):','    print(i * $m)'],"Use a for loop from 1 to 3 to print i multiplied by $m",M => [1, 2, 3].map(i => i * M.m).join("\n"));
p(5,"heavy","accum","Build a string",['line = ""','for i in range(3):','    line += "$c"','print(line)'],"Make line an empty string, add “$c” to it 3 times in a for loop, then print it",M => M.c.repeat(3));
p(5,"block","while","Guard: count to a limit",['tries = 0','while tries < $m:','    tries += 1','print(tries)'],"Make tries equal to 0, add one while tries is under $m, then print tries",M => M.m);
p(5,"block","while","Fix: never stops",['i = 1','while i <= 3:','    print(i)','    i += 1'],PFIX,"1\n2\n3",pb(['i = 1','while i <= 3:','    print(i)']));
p(5,"block","for","Fix: missing colon",['for i in range(3):','    print("$w")'],PFIX,"$w\n$w\n$w",pb(['for i in range(3)','    print("$w")']));
p(5,"block","for","Fix: wrong word",['for i in range(3):','    print("$w")'],PFIX,"$w\n$w\n$w",pb(['for i on range(3):','    print("$w")']));
p(5,"block","brk","Fix: wrong keyword",['for i in range(1, 5):','    if i == 2:','        continue','    print(i)'],PFIX,"1\n3\n4",pb(['for i in range(1, 5):','    if i == 2:','        skip','    print(i)']));
p(5,"block","for","Fix: range of a number",['for i in range(1, 4):','    print(i)'],PFIX,"1\n2\n3",pb(['for i in 4:','    print(i)']));

/* ---------- level 6: functions ---------- */
p(6,"attack","def","A function",['def greet():','    print("$w")','greet()'],"Write a function greet that prints “$w”, then call it","$w");
p(6,"attack","params","A parameter",['def shout(word):','    print(word)','shout("$w")'],"Write a function shout with a parameter word that prints it, then call shout with “$w”","$w");
p(6,"attack","ret","Return a value",['def double(n):','    return n * 2','print(double($n))'],"Write a function double that returns n times 2, then print double($n)",M => M.n * 2);
p(6,"attack","def","Call it twice",['def cheer():','    print("$w!")','cheer()','cheer()'],"Write a function cheer that prints “$w!”, then call it twice","$w!\n$w!");
p(6,"heavy",["params","ret"],"Two parameters",['def add(a, b):','    return a + b','print(add($n, $m))'],"Write a function add that returns a + b, then print add($n, $m)",M => M.n + M.m);
p(6,"heavy","lam","Lambda",['square = lambda n: n * n','print(square($m))'],"Store a lambda in square that returns n times n, then print square($m)",M => M.m * M.m);
p(6,"heavy","dflt","Default value",['def hello(name="$w"):','    return "Hi " + name','print(hello())'],"Write a function hello whose parameter name defaults to “$w” and returns Hi and the name, then print hello()","Hi $w");
p(6,"heavy",["ret","fstr"],"Return an f-string",['def intro(name):','    return f"I am {name}"','print(intro("$w"))'],"Write a function intro that returns I am and the name with an f-string, then print intro(“$w”)","I am $w");
p(6,"heavy","kw","Keyword argument",['def intro(name, hp):','    return f"{name} {hp}"','print(intro(hp=$n, name="$w"))'],"Write a function intro that returns the name and hp, then call it with the keyword arguments hp=$n and name=“$w”",M => M.w + " " + M.n);
p(6,"heavy","scope","Two variables, same name",['x = "$w"','def show():','    x = "$x"','    print(x)','show()','print(x)'],"Make x hold “$w”, write a function show with its own x holding “$x” that prints it, then call show and print the outer x","$x\n$w");
p(6,"heavy",["ret","cmp"],"Return a test",['def is_big(n):','    return n > $m','print(is_big($n))'],"Write a function is_big that returns whether n is over $m, then print is_big($n)","True");
p(6,"heavy","ret","No return",['def nothing():','    pass','print(nothing())'],"Write a function nothing whose body is just pass, then print what it gives back","None");
p(6,"block","ret","Guard: clamp",['def clamp(n):','    if n > $m:','        return $m','    return n','print(clamp($n))'],"Write a function clamp that returns $m when n is over $m and n otherwise, then print clamp($n)",M => M.m);
p(6,"block","ret","Fix: no return",['def double(n):','    return n * 2','print(double($n))'],PFIX,M => M.n * 2,pb(['def double(n):','    n * 2','print(double($n))']));
p(6,"block","def","Fix: forgot the brackets",['def greet():','    print("$w")','greet()'],PFIX,"$w",pb(['def greet():','    print("$w")','greet']));
p(6,"block","def","Fix: wrong keyword",['def greet():','    print("$w")','greet()'],PFIX,"$w",pb(['function greet():','    print("$w")','greet()']));
p(6,"block","params","Fix: missing parameter",['def add(a, b):','    return a + b','print(add($n, $m))'],PFIX,M => M.n + M.m,pb(['def add(a):','    return a + b','print(add($n, $m))']));
p(6,"block","def","Fix: missing colon",['def greet():','    print("$w")','greet()'],PFIX,"$w",pb(['def greet()','    print("$w")','greet()']));

/* ---------- level 7: lists ---------- */
p(7,"attack","lst","A list",['bag = ["$w", "$x"]','print(bag)'],"Make a list bag holding “$w” and “$x”, then print it",M => "['" + M.w + "', '" + M.x + "']");
p(7,"attack","lidx","First item",['bag = ["$w", "$x"]','print(bag[0])'],"Make a list bag holding “$w” and “$x”, then print the first item","$w");
p(7,"attack","strlen","How many",['bag = ["$w", "$x", "$y"]','print(len(bag))'],"Make a list bag holding “$w”, “$x” and “$y”, then print how many items it has","3");
p(7,"heavy","append","Add one",['bag = ["$w"]','bag.append("$x")','print(len(bag))'],"Make a list bag holding “$w”, append “$x” to it, then print its length","2");
p(7,"heavy","append","Take one off",['bag = ["$w", "$x"]','bag.pop()','print(bag)'],"Make a list bag holding “$w” and “$x”, pop the last item off, then print bag",M => "['" + M.w + "']");
p(7,"heavy","lidx","Last item",['bag = ["$w", "$x", "$y"]','print(bag[-1])'],"Make a list bag holding “$w”, “$x” and “$y”, then print the last item using -1","$y");
p(7,"heavy","lloop","Loop the bag",['bag = ["$w", "$x"]','for item in bag:','    print(item)'],"Make a list bag holding “$w” and “$x”, then print each item with a for loop","$w\n$x");
p(7,"heavy","lin","Is it there",['bag = ["$w", "$x"]','print("$w" in bag)'],"Make a list bag holding “$w” and “$x”, then print whether “$w” is in it","True");
p(7,"heavy","lin","Where is it",['bag = ["$w", "$x"]','print(bag.index("$x"))'],"Make a list bag holding “$w” and “$x”, then print the index of “$x”","1");
p(7,"heavy","join","Join them up",['bag = ["$w", "$x", "$y"]','print(", ".join(bag))'],"Make a list bag holding “$w”, “$x” and “$y”, then print them joined with a comma and a space","$w, $x, $y");
p(7,"heavy","lidx","Swap an item",['bag = ["$w", "$x"]','bag[0] = "$y"','print(bag)'],"Make a list bag holding “$w” and “$x”, replace the first item with “$y”, then print bag",M => "['" + M.y + "', '" + M.x + "']");
p(7,"heavy","lslice","Slice it",['bag = ["$w", "$x", "$y"]','print(bag[1:3])'],"Make a list bag holding “$w”, “$x” and “$y”, then print the items from index 1 up to 3",M => "['" + M.x + "', '" + M.y + "']");
p(7,"heavy",["lloop","accum"],"Add up the list",['nums = [$n, $m, 1]','total = 0','for x in nums:','    total += x','print(total)'],"Make a list nums holding $n, $m and 1, add them all into total with a for loop, then print total",M => M.n + M.m + 1);
p(7,"heavy","lsort","Sorted",['nums = [$n, $m, 1]','print(sorted(nums))'],"Make a list nums holding $n, $m and 1, then print it sorted",M => "[1, " + M.m + ", " + M.n + "]");
p(7,"heavy","join","Split",['words = "$w $x".split()','print(words)'],"Split the string “$w $x” into a list called words with .split(), then print it",M => "['" + M.w + "', '" + M.x + "']");
p(7,"item","lst","Potion bag",['bag = ["potion", "$w"]','print(bag[0])'],"Make a list bag holding “potion” and “$w”, then print the first item","potion",{ name:"Potion" });
p(7,"item","append","Pack a potion",['bag = []','bag.append("potion")','print(bag)'],"Make an empty list bag, append “potion” to it, then print bag","['potion']",{ name:"Big potion" });
p(7,"item","lloop","Check the bag",['bag = ["potion", "$w"]','for item in bag:','    print(item)'],"Make a list bag holding “potion” and “$w”, then print each item with a for loop","potion\n$w",{ name:"Scroll", fx:{ heal:18, shield:.5 } });
p(7,"item","strlen","Count the potions",['bag = ["potion", "$w", "$x"]','print(len(bag))'],"Make a list bag holding “potion”, “$w” and “$x”, then print its length","3",{ name:"Potion" });
p(7,"block","lidx","Guard: not empty",['bag = ["$w", "$x"]','if len(bag) > 0:','    print(bag[0])'],"Make a list bag holding “$w” and “$x”, then if it is not empty, print its first item","$w");
p(7,"block","lidx","Fix: wrong index",['bag = ["$w", "$x"]','print(bag[1])'],PFIX,"$x",pb(['bag = ["$w", "$x"]','print(bag[2])']));
p(7,"block","strlen","Fix: length is not a property",['bag = ["$w", "$x"]','print(len(bag))'],PFIX,"2",pb(['bag = ["$w", "$x"]','print(bag.length)']));
p(7,"block","lst","Fix: missing bracket",['bag = ["$w", "$x"]','print(bag)'],PFIX,M => "['" + M.w + "', '" + M.x + "']",pb(['bag = ["$w", "$x"','print(bag)']));
p(7,"block","append","Fix: wrong method name",['bag = ["$w"]','bag.append("$x")','print(len(bag))'],PFIX,"2",pb(['bag = ["$w"]','bag.push("$x")','print(len(bag))']));

/* ---------- level 8: dictionaries ---------- */
p(8,"attack",["dct","dget"],"A dictionary",['hero = {"name": "$w", "hp": $n}','print(hero["name"])'],"Make a dictionary hero with name “$w” and hp $n, then print its name","$w");
p(8,"attack","dget","Read a number",['hero = {"name": "$w", "hp": $n}','print(hero["hp"])'],"Make a dictionary hero with name “$w” and hp $n, then print its hp",M => M.n);
p(8,"attack","dget","Safe read",['hero = {"name": "$w"}','print(hero.get("hp", 0))'],"Make a dictionary hero with name “$w”, then print its hp using .get with a default of 0","0");
p(8,"heavy","dset","Add a key",['hero = {"name": "$w"}','hero["gold"] = $m','print(hero["gold"])'],"Make a dictionary hero with name “$w”, add a gold key of $m, then print it",M => M.m);
p(8,"heavy","dset","Change a value",['hero = {"name": "$w", "hp": $n}','hero["hp"] = $m','print(hero["hp"])'],"Make a dictionary hero with name “$w” and hp $n, change hp to $m, then print it",M => M.m);
p(8,"heavy","dnest","Nested dictionary",['hero = {"name": "$w", "bag": {"potions": $n}}','print(hero["bag"]["potions"])'],"Make a dictionary hero with name “$w” and a bag dictionary holding potions of $n, then print hero[\"bag\"][\"potions\"]",M => M.n);
p(8,"heavy","ditems","List the keys",['hero = {"name": "$w", "hp": $n}','print(list(hero.keys()))'],"Make a dictionary hero with name “$w” and hp $n, then print its keys as a list",M => "['name', 'hp']");
p(8,"heavy","ditems","Loop the pairs",['hero = {"name": "$w", "hp": $n}','for key, value in hero.items():','    print(key, value)'],"Make a dictionary hero with name “$w” and hp $n, then print each key and value with .items()",M => "name " + M.w + "\nhp " + M.n);
p(8,"heavy",["fstr","dget"],"f-string with keys",['hero = {"name": "$w", "hp": $n}','print(f"{hero[\'name\']} has {hero[\'hp\']} HP")'],"Make a dictionary hero with name “$w” and hp $n, then print name has hp HP with an f-string",M => M.w + " has " + M.n + " HP");
p(8,"heavy","dnest","List of dictionaries",['party = [{"name": "$w"}, {"name": "$x"}]','print(party[1]["name"])'],"Make a list party of two dictionaries with the names “$w” and “$x”, then print the second name","$x");
p(8,"heavy","ddel","Remove a key",['hero = {"name": "$w", "hp": $n}','del hero["hp"]','print(hero)'],"Make a dictionary hero with name “$w” and hp $n, delete hp, then print hero",M => "{'name': '" + M.w + "'}");
p(8,"heavy","dcheck","Is the key there",['hero = {"name": "$w", "hp": $n}','print("hp" in hero)'],"Make a dictionary hero with name “$w” and hp $n, then print whether “hp” is in hero","True");
p(8,"heavy","dcheck","Count the pairs",['hero = {"name": "$w", "hp": $n}','print(len(hero))'],"Make a dictionary hero with name “$w” and hp $n, then print how many pairs it has","2");
p(8,"item","dct","Potion dictionary",['potion = {"name": "Elixir", "heal": $n}','print(potion["heal"])'],"Make a dictionary potion with name “Elixir” and heal $n, then print its heal",M => M.n,{ name:"Elixir", fx:{ heal:24, shield:.5 } });
p(8,"item","dget","Read the label",['potion = {"name": "$w", "heal": $n}','print(potion["name"])'],"Make a dictionary potion with name “$w” and heal $n, then print its name","$w",{ name:"Potion" });
p(8,"item","dset","Label a potion",['potion = {"heal": $n}','potion["name"] = "$w"','print(potion["name"])'],"Make a dictionary potion with heal $n, add a name of “$w”, then print the name","$w",{ name:"Big potion" });
p(8,"block","dget","Guard: alive",['hero = {"name": "$w", "hp": $n}','if hero["hp"] > 0:','    print(hero["name"])'],"Make a dictionary hero with name “$w” and hp $n, then if hp is over 0, print the name","$w");
p(8,"block","dct","Fix: missing comma",['hero = {"name": "$w", "hp": $n}','print(hero["name"])'],PFIX,"$w",pb(['hero = {"name": "$w" "hp": $n}','print(hero["name"])']));
p(8,"block","dget","Fix: missing quotes",['hero = {"name": "$w", "hp": $n}','print(hero["name"])'],PFIX,"$w",pb(['hero = {"name": "$w", "hp": $n}','print(hero[name])']));
p(8,"block","dget","Fix: dot instead of brackets",['hero = {"name": "$w", "hp": $n}','print(hero["name"])'],PFIX,"$w",pb(['hero = {"name": "$w", "hp": $n}','print(hero.name)']));
p(8,"block","dct","Fix: equals instead of colon",['hero = {"name": "$w", "hp": $n}','print(hero["hp"])'],PFIX,M => M.n,pb(['hero = {"name": "$w", "hp" = $n}','print(hero["hp"])']));
p(8,"block","ditems","Fix: forgot items",['hero = {"name": "$w", "hp": $n}','for key, value in hero.items():','    print(key)'],PFIX,"name\nhp",pb(['hero = {"name": "$w", "hp": $n}','for key, value in hero:','    print(key)']));

/* ---------- level 9: comprehensions and tools ---------- */
p(9,"attack","comp","Comprehension",['doubled = [n * 2 for n in [$m, $n]]','print(doubled)'],"Use a list comprehension to double every number in [$m, $n] into doubled, then print it",M => "[" + M.m * 2 + ", " + M.n * 2 + "]");
p(9,"attack","compif","Comprehension with if",['big = [n for n in [$m, $n] if n > $m]','print(big)'],"Use a list comprehension to keep only the numbers over $m from [$m, $n] into big, then print it",M => "[" + M.n + "]");
p(9,"attack","agg","sum",'print(sum([$m, $n, 1]))',"Print the sum of the list [$m, $n, 1], using sum()",M => M.m + M.n + 1);
p(9,"heavy","agg","max",'print(max([$m, $n, 1]))',"Print the biggest number in [$m, $n, 1], using max()",M => M.n);
p(9,"heavy","agg","min",'print(min([$m, $n, 1]))',"Print the smallest number in [$m, $n, 1], using min()","1");
p(9,"heavy","comp","Shout them all",['loud = [s.upper() for s in ["$w", "$x"]]','print(loud)'],"Use a list comprehension to make “$w” and “$x” capital letters into loud, then print it",M => "['" + M.w.toUpperCase() + "', '" + M.x.toUpperCase() + "']");
p(9,"heavy",["compif","strlen"],"Long words only",['long = [s for s in ["$w", "$x"] if len(s) > 3]','print(long)'],"Use a list comprehension to keep the words longer than 3 letters from “$w” and “$x” into long, then print it",M => "[" + [M.w, M.x].filter(s => s.length > 3).map(s => "'" + s + "'").join(", ") + "]");
p(9,"heavy","enum","enumerate",['for i, s in enumerate(["$w", "$x"]):','    print(i, s)'],"Use enumerate to print the index and the item for “$w” and “$x”",M => "0 " + M.w + "\n1 " + M.x);
p(9,"heavy","zip","zip",['for a, b in zip(["$w", "$x"], [$m, $n]):','    print(a, b)'],"Use zip to walk along [“$w”, “$x”] and [$m, $n] together, and print each pair",M => M.w + " " + M.m + "\n" + M.x + " " + M.n);
p(9,"heavy","keyf","Sort by length",['words = sorted(["$w", "$x"], key=len)','print(words)'],"Sort [“$w”, “$x”] by length with key=len into words, then print it",M => "[" + [M.w, M.x].map((s, i) => [s, i]).sort((a, b) => a[0].length - b[0].length || a[1] - b[1]).map(a => "'" + a[0] + "'").join(", ") + "]");
p(9,"heavy","lam","Sort with a lambda",['nums = sorted([$m, $n, 1], key=lambda n: -n)','print(nums)'],"Sort [$m, $n, 1] biggest first using key=lambda n: -n into nums, then print it",M => "[" + M.n + ", " + M.m + ", 1]");
p(9,"heavy","tuple","Unpack a tuple",['point = ($m, $n)','x, y = point','print(y, x)'],"Make a tuple point of $m and $n, unpack it into x and y, then print y and x",M => M.n + " " + M.m);
p(9,"heavy","set","Remove duplicates",['nums = set([$m, $m, $n])','print(len(nums))'],"Make a set from [$m, $m, $n] and print how many different values it holds","2");
p(9,"heavy",["comp","accum"],"Squares",['squares = [n * n for n in range(1, 4)]','print(squares)'],"Use a list comprehension with range(1, 4) to make the squares into squares, then print it","[1, 4, 9]");
p(9,"item","comp","Boost the potions",['boosted = [n + 5 for n in [$m, $n]]','print(boosted)'],"Use a list comprehension to add 5 to every number in [$m, $n] into boosted, then print it",M => "[" + (M.m + 5) + ", " + (M.n + 5) + "]",{ name:"Elixir", fx:{ heal:24, shield:.5 } });
p(9,"item","agg","Count the potions",['total = sum([$m, $n])','print(total)'],"Use sum() to add up [$m, $n] into total, then print it",M => M.m + M.n,{ name:"Big potion" });
p(9,"item","agg","Strongest potion",['print(max([$m, $n]))'],"Print the biggest number in [$m, $n], using max()",M => M.n,{ name:"Scroll", fx:{ heal:18, shield:.5 } });
p(9,"block","comp","Guard: empty list",['nums = [$m, $n]','if nums:','    print([n * 2 for n in nums])'],"Make a list nums of $m and $n, then if it is not empty, print it with every number doubled using a comprehension",M => "[" + M.m * 2 + ", " + M.n * 2 + "]");
p(9,"block","comp","Fix: brackets",['doubled = [n * 2 for n in [$m, $n]]','print(doubled)'],PFIX,M => "[" + M.m * 2 + ", " + M.n * 2 + "]",pb(['doubled = [n * 2 for n in [$m, $n])','print(doubled)']));
p(9,"block","compif","Fix: if before for",['big = [n for n in [$m, $n] if n > $m]','print(big)'],PFIX,M => "[" + M.n + "]",pb(['big = [n if n > $m for n in [$m, $n]]','print(big)']));
p(9,"block","agg","Fix: wrong name",['print(sum([$m, $n, 1]))'],PFIX,M => M.m + M.n + 1,pb(['print(total([$m, $n, 1]))']));
p(9,"block","enum","Fix: missing in",['for i, s in enumerate(["$w", "$x"]):','    print(i, s)'],PFIX,M => "0 " + M.w + "\n1 " + M.x,pb(['for i, s enumerate(["$w", "$x"]):','    print(i, s)']));
p(9,"block","keyf","Fix: key needs a function",['words = sorted(["$w", "$x"], key=len)','print(words)'],PFIX,M => "[" + [M.w, M.x].map((s, i) => [s, i]).sort((a, b) => a[0].length - b[0].length || a[1] - b[1]).map(a => "'" + a[0] + "'").join(", ") + "]",pb(['words = sorted(["$w", "$x"], key=len())','print(words)']));

/* ---------- the final fight: spells borrowed from the other four languages, so Pythona can cast any of them ---------- */
(function borrow(){
  [["html", SP, CON], ["css", CSS_SP, CSS_CON], ["cpp", CPP_SP, CPP_CON], ["js", JS_SP, JS_CON]].forEach(([trk, list, con]) => {
    list.filter(s => !s.page).forEach(s => {
      const ids = s.c.map(id => trk + ":" + id);
      s.c.forEach(id => { if (!PY_CON[trk + ":" + id]) PY_CON[trk + ":" + id] = Object.assign({}, con[id], { x:true }); });
      PY_SP.push(Object.assign({}, s, { id:++spId, c:ids, trk, fin:true, L:10 }));
    });
  });
})();
