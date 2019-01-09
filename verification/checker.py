# import Hex
from string import ascii_uppercase as au
from collections import Counter


directions = ('N', 'NE', 'SE', 'S', 'SW', 'NW')


class Cube:

    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y and self.z == other.z

    def cube_add(self, cube_d):
        return Cube(self.x + cube_d.x,
                    self.y + cube_d.y,
                    self.z + cube_d.z)

    def get_neighbor_dir(self, neighbor):
        cube_directions = [
            Cube(0, +1, -1), Cube(+1, 0, -1), Cube(+1, -1, 0),
            Cube(0, -1, +1), Cube(-1, 0, +1), Cube(-1, +1, 0),
        ]
        for i, cd in enumerate(cube_directions):
            if self.cube_add(cd) == neighbor:
                return i

    def get_vector(self, c2):
        line_cubes = self.cube_linedraw(c2)
        result = []
        for i in range(len(line_cubes)-1):
            result.append(line_cubes[i].get_neighbor_dir(line_cubes[i+1]))

        return Counter(result)

    def cube_linedraw(self, b):

        def lerp(a, b, t):
            return a + (b - a) * t

        def cube_lerp(a, b, t):
            return Cube(lerp(a.x, b.x, t),
                        lerp(a.y, b.y, t),
                        lerp(a.z, b.z, t))

        def cube_distance(a, b):
            return (abs(a.x - b.x) + abs(a.y - b.y) + abs(a.z - b.z)) // 2

        def cube_round(cube):
            rx = round(cube.x)
            ry = round(cube.y)
            rz = round(cube.z)
            x_diff = abs(rx - cube.x)
            y_diff = abs(ry - cube.y)
            z_diff = abs(rz - cube.z)
            if x_diff > y_diff and x_diff > z_diff:
                rx = -ry-rz
            elif y_diff > z_diff:
                ry = -rx-rz
            else:
                rz = -rx-ry
            return Cube(rx, ry, rz)

        N = cube_distance(self, b)
        results = []
        for i in range(N+1):
            results.append(cube_round(cube_lerp(self, b, 1.0 / N * i)))
        return results


class OffsetCoord:
    def __init__(self, col, row):
        self.col = col
        self.row = row

    def evenq_to_cube(self):
        x = self.col
        z = self.row - (self.col + (self.col & 1)) // 2
        y = -x - z
        return Cube(x, y, z)


def a1_to_cube(a1):
    return OffsetCoord(au.index(a1[0])+1, int(a1[1])).evenq_to_cube()


def vector_normalize(dr, vec):
    dn = lambda yd, td: (td+(6-yd)) % 6
    return {dn(dr, d): [0, vec[d]][d in vec] for d in range(6)}


def arc_check(degree, vec):

    if degree == 0:
        if vec[1] or vec[2] or vec[3] or vec[4] or vec[5]:
            return False
        return True

    if degree == 60:
        if vec[2] or vec[3] or vec[4]:
            return False
        if vec[1]-vec[0] > 0:
            return False
        if vec[5]-vec[0] > 0:
            return False
        return True

    if degree == 120:
        if vec[2] or vec[3] or vec[4]:
            return False
        return True


def arc_hexes(y, d, cannon, enemies):
    deg, min_range, max_range = cannon
    result = set()
    for e in enemies:
        vec = vector_normalize(d, a1_to_cube(y).get_vector(a1_to_cube(e)))
        if min_range <= sum(vec.values()) <= max_range and arc_check(deg, vec):
            result.add(e)
    return result


def combination_of_dirs(n, ds):
    if not n:
        yield ds
    else:
        for d in directions:
            yield from combination_of_dirs(n-1, ds+[d])


def fortress_cannons(fort, cannons, enemies, output):

    if output is None:
        for dir in combination_of_dirs(len(cannons), []):
            hexes = set()
            for i, cannon in enumerate(cannons):
                hexes |= arc_hexes(fort, directions.index(dir[i]), cannon, enemies)
            if hexes >= enemies:
                return False
        return True

    if not (isinstance(output, list) and len(output) == len(cannons)):
        return False
    if not all(o in directions for o in output):
        return False

    hexes = set()
    for i, cannon in enumerate(cannons):
        hexes |= arc_hexes(fort, directions.index(output[i]), cannon, enemies)
    return hexes >= enemies


if __name__ == '__main__':
    assert fortress_cannons('F4', [(0, 1, 3), (0, 1, 2)], {'C3', 'F2'}, ['NW', 'N'])
    assert fortress_cannons('F4', [(0, 1, 3), (0, 1, 2), (0, 1, 2)], {'C3', 'F2', 'F6'}, ['NW', 'N', 'S'])
    assert fortress_cannons('F4', [(120, 1, 3)], {'H3', 'F5'}, ['SE'])
    assert fortress_cannons('F4', [(120, 0, 0)], {'H3', 'F5'}, None)
    assert fortress_cannons('A1', [(0, 1, 11)], {'L6'}, ['SE'])
