"""
TESTS is a dict with all you tests.
Keys for this will be categories' names.
Each test is dict with
    "input" -- input data for user function
    "answer" -- your right answer
    "explanation" -- not necessary key, it's using for additional info in animation.
"""
from random import randint, sample
from string import ascii_uppercase as au


randoms = []
all_coords = [c+str(r) for c in au[:12] for r in range(1, 10)]

for _ in range(6):
    coords = sample(all_coords, randint(2, 5))
    fort, enemies = coords[0], coords[1:]
    print(fort, enemies)
    cannons = []
    for _ in range(randint(2, 4)):
        arc = [0, 60, 60, 60, 120, 120][randint(0, 5)]
        min_range = randint(1, 3)
        max_range = min_range+randint(2, 7)
        cannons.append((arc, min_range, max_range))
    args = [fort, cannons, enemies]
    randoms.append({'input': args, 'answer': args})

TESTS = {
    "Randoms": randoms,
    "Basics": [
        {
            "input": ['F5', 
                [[0, 1, 4],], 
                ['F2',],
            ],
            "answer": ['F5', 
                [[0, 1, 4],], 
                ['F2',],
            ],
        },
        {
            "input": ['F5', 
                [[60, 1, 6],], 
                ['K4',],
            ],
            "answer": ['F5', 
                [[60, 1, 6],], 
                ['K4',],
            ],
        },
        {
            "input": ['F5', 
                [[120, 1, 4],], 
                ['B3', 'E8',],
            ],
            "answer": ['F5', 
                [[120, 1, 4],], 
                ['B3', 'E8',],
            ],
        },
        {
            "input": ['F5', 
                [[0, 2, 6], [120, 1, 3], [60, 1, 4]], 
                ['L2', 'D3', 'C6', 'E9'],
            ],
            "answer": ['F5', 
                [[0, 2, 6], [120, 1, 3], [60, 1, 4]], 
                ['L2', 'D3', 'C6', 'E9'],
            ],
        },
        {
            "input": ['F5', 
                [[0, 1, 6], [120, 2, 3],], 
                ['A3', 'E6', 'G7'],
            ],
            "answer": ['F5', 
                [[0, 1, 6], [120, 2, 3],], 
                ['A3', 'E6', 'G7'],
            ],
        },
    ],
    "Extras": [
        {
            "input": ['F5', 
                [[120, 1, 5], [120, 1, 5]], 
                ['B3', 'F1', 'H3', 'G9', 'K3', 'D6'],
            ],
            "answer": ['F5', 
                [[120, 1, 5], [120, 1, 5]], 
                ['B3', 'F1', 'H3', 'G9', 'K3', 'D6'],
            ],
        },
        {
            "input": ['F5', 
                [[0, 1, 6], [0, 1, 6], [0, 1, 6], [0, 1, 6]], 
                ['L2', 'J7', 'D4', 'A8'],
            ],
            "answer": ['F5', 
                [[0, 1, 6], [0, 1, 6], [0, 1, 6], [0, 1, 6]], 
                ['L2', 'J7', 'D4', 'A8'],
            ],
        },
        {
            "input": ['D6', 
                [[60, 2, 2], [60, 4, 4], [60, 6, 6], [60, 8, 8]], 
                ['F5', 'G4', 'J4', 'K2'],
            ],
            "answer": ['D6', 
                [[60, 2, 2], [60, 4, 4], [60, 6, 6], [60, 8, 8]], 
                ['F5', 'G4', 'J4', 'K2'],
            ],
        },
    ],
}
