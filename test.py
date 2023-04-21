baby = "katsudon<3"
for char in baby.split():
    grandpa = []
    for y in range(12, -12, -1):
        lst = []
        a = ""
        for x in range(-35, 35):
            formula = ((x*0.045)**2+(y*0.11)**2-1)**3-(x*0.045)**2*(y*0.11)**3
            if formula <= 0:
                a += char[(x-y) % len(char)]
            else:
                a += " "
        grandpa.append(a)
    print("\n".join(grandpa))
