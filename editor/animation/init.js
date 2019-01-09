//Dont change it
requirejs(['ext_editor_io', 'jquery_190', 'raphael_210'],
    function (extIO, $, TableComponent) {
        function fastTrainCanvas(dom, input, output, data) {

            $(dom.parentNode).find(".answer").remove()

            const AU = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            const DIRS = ['N', 'NE', 'SE', 'S', 'SW', 'NW']

            class Tri {
                //Equilateral triangle
                static draw_eq_tri({paper,cx=0,cy=0,edge=10,rotate=0}={}) {
                    const ALTITUDE = Math.sqrt(edge**2-(edge/2)**2);
                    const [x1, y1]
                        = [cx, cy - (ALTITUDE-(edge/2)/Math.sqrt(3))];
                    const [x2, y2] = [cx+edge/2, cy+(edge/2)/Math.sqrt(3)];
                    const [x3, y3] = [cx-edge/2, cy+(edge/2)/Math.sqrt(3)];
                    const path = ['M', x1, y1,
                                  'L', x2, y2,
                                  'L', x3, y3,
                                  'Z'].join(' ');
                    return paper.path(path).transform(
                        'r'+ rotate + ' ' + cx + ' ' + cy);
                }
            } 
            class Hex_grid {
                constructor({
                    paper, sx=0, sy=0, row=10, col=10, r=30, disp_hex=[],
                    numbered=false, number=[false, 0, 0, {}]}) {
                    this.paper = paper;
                    this.sx = sx;
                    this.sy = sy;
                    this.row = row;
                    this.col = col;
                    this.r = r;
                    this.disp_hex = disp_hex;
                    this.height = Math.sqrt(r**2 - (r/2)**2)*2;
                    this.paper_w = col*r*1.5 + r/2;
                    this.paper_h = row * this.height + this.height/2;
                    this.dic = {};
                    this.numbered = number[0];
                    this.number_offset_x = number[1];
                    this.number_offset_y = number[2];
                    this.number_attr = number[3];
                    this.coord = {};
                }

                /*----------------------------------------*
                 *
                 * hex (6 edges)
                 *
                 *----------------------------------------*/
                hexagon (x0, y0, hn) {

                    let path = '';

                    for (let i = 0; i <= 6; i += 1) {
                        const a = i * 60;
                        const x = this.r * Math.cos(a * Math.PI / 180);
                        const y = this.r * Math.sin(a * Math.PI / 180);
                        const X = Math.round((x+x0)*100)/100;
                        const Y = Math.round((y+y0)*100)/100;
                        path += (i == 0 ? 'M': 'L') + (X) + ',' + (Y);
                    }

                    path += 'z ';

                    const hex = this.paper.path(path);

                    this.dic[hn] = hex;
                    this.coord[hn] = {x: x0, y: y0};

                    return hex;
                }

                /*----------------------------------------*
                 *
                 * get hex
                 *
                 *
                 *----------------------------------------*/
                get_hex (hn) {
                    return this.dic[hn];
                }

                /*----------------------------------------*
                 *
                 * hex grid
                 *
                 *----------------------------------------*/
                draw_grid() {

                    const height = (Math.sqrt(this.r**2 - (this.r/2)**2))*2;
                    const sx = this.sx + this.r;
                    const sy = this.sy + height/2;

                    let path = '';
                    const ps = this.paper.set();

                    for (let y=0; y < this.row; y += 1) {
                        for (let x=0; x < this.col; x += 1) {
                            const hn = (x+1)*100+y+1;
                            if (this.disp_hex.length !== 0
                                && ! this.disp_hex.includes(hn)) {
                                continue;
                            }

                            const cy = sy + y * height + (x%2)*height/2;
                            const cx = sx + x * this.r * 1.5;

                            // draw hexagon
                            ps.push(this.hexagon(cx, cy, hn));

                            // numbered
                            if (this.numbered)
                                this.paper.text(
                                    cx+this.number_offset_x,
                                    cy+this.number_offset_y,
                                    AU[x]+(y+1)).attr(this.number_attr);
                        }
                    }
                    return ps;
                }

            }

            class OffsetCoord {
                constructor (col, row) {
                    this.col = col;
                    this.row = row;
                }
            }

            class Cube {
                constructor (x, y, z) {
                    this.x = x;
                    this.y = y;
                    this.z = z;
                }

                cube_modify(d) {
                    const c0 = new Cube(0, +1, -1)
                    const c1 = new Cube(+1, 0, -1)
                    const c2 = new Cube(+1, -1, 0)
                    const c3 = new Cube(0, -1, +1)
                    const c4 = new Cube(-1, 0, +1)
                    const c5 = new Cube(-1, +1, 0)
                    return  [c0, c1, c2, c3, c4, c5][d]
                }

                cube_to_evenq() {
                    const col = cube.x;
                    const row = cube.z + (col + (col & 1)) / 2;
                    return new OffsetCoord(col, row);
                }

                neighbor(dir) {
                    return this.add(this.cube_direction(dir));
                }

                add(cube_d) {
                    return new Cube(this.x+cube_d.x,
                                    this.y+cube_d.y,
                                    this.z+cube_d.z);
                }

                linedraw(b) {
                    function lerp(a, b, t) {
                        return a + (b - a) * t
                    }

                    function cube_lerp(a, b, t) {
                        return new Cube(lerp(a.x, b.x, t),
                                        lerp(a.y, b.y, t),
                                        lerp(a.z, b.z, t));
                    }

                    function cube_round(cube) {
                        let rx = Math.round(cube.x);
                        let ry = Math.round(cube.y);
                        let rz = Math.round(cube.z);

                        const x_diff = Math.abs(rx - cube.x);
                        const y_diff = Math.abs(ry - cube.y);
                        const z_diff = Math.abs(rz - cube.z);

                        if (x_diff > y_diff && x_diff > z_diff) {
                            rx = -ry-rz
                        } else if (y_diff > z_diff) {
                            ry = -rx-rz
                        } else {
                            rz = -rx-ry
                        }
                        return new Cube(rx, ry, rz);
                    }
                    const N = this.cube_distance(b);
                    const results = [];

                    for (let i=0; i < N+1; i += 1) {
                        results.push(
                            cube_round(cube_lerp(this, b, 1.0 / N * i)))
                    }
                    return results
                }

                equals(c2) {
                   return this.x == c2.x && this.y == c2.y && this.z == c2.z
                }

                cube_distance(b) {
                    return (
                        (Math.abs(this.x - b.x) + Math.abs(this.y - b.y)
                            + Math.abs(this.z - b.z)) / 2);
                }

                get_vector(other) {
                    const hexes = this.linedraw(other)
                    const dic_dir = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
                    hexes.slice(1).forEach((hx, i)=>{
                        for (let j=0; j < 6; j += 1) {
                            if (hexes[i].add(
                                this.cube_modify(j)).equals(hx)) {
                                dic_dir[j] += 1
                                break
                            }
                        }
                    })
                    return dic_dir
                }

                static cubed(hex_num) {
                    return this.evenq_to_cube(
                        this.hex_num_to_offset(hex_num));
                }

                static evenq_to_cube(hex) {
                    const x = hex.col;
                    const z = hex.row - (hex.col + (hex.col & 1)) / 2
                    const y = -x  -z;
                    return new Cube(x, y, z);
                }

                static hex_num_to_offset(hex_num) {
                    const col = Math.floor(hex_num / 100);
                    const row = hex_num % 100;
                    return new OffsetCoord(col, row);
                }

                static cube_to_hex_num(cube) {
                    const os = this.cube_to_evenq(cube);
                    return os.col*100 + os.row;
                }

                static distance_cube(c1, c2) {
                    return this.cube_linedraw(h1, h2).length - 1;
                }
            }

            function cubed(hex_a1) {
                const m = hex_a1.match(/([A-Z]+)(\d+)/)
                if (m) {
                    const os = new OffsetCoord(
                        AU.indexOf(m[1])+1, parseInt(m[2]))
                    return Cube.evenq_to_cube(os)
                }
            }

            function vector_normalize(dr, vec) {
                const dn = (yd, td)=>(td+(6-yd)) % 6
                const result = {}
                for (let i=0; i < 6; i += 1) {
                    result[dn(dr, i)] = vec[i] | 0
                }
                return result
            }

            function arc_check(deg, y, d, e, min_range, max_range) {
                const vec
                    = vector_normalize(d, cubed(y).get_vector(cubed(e)))
                const dist = Object.values(vec).reduce((a, b)=>(a+b))
                return (
                    (dist >= min_range && dist <= max_range)
                    &&
                    (deg === 0
                        && vec[1]+vec[2]+vec[3]+vec[4]+vec[5] === 0 ||
                     deg === 60 && vec[2]+vec[3]+vec[4] === 0
                            && vec[0]-vec[1] >= 0 && vec[0]-vec[5] >= 0 ||
                     deg === 120 && vec[2]+vec[3]+vec[4] === 0)
                )
            }

            function get_arc_hexes(
                y, d, deg, min_range, max_range, row, col) {
                result = []
                AU.split('').slice(0, col).forEach(c=>{
                    for (let i=1; i <= row; i += 1) {
                        const e = c+i
                        if (y != e && arc_check(
                            deg, y, d, e, min_range, max_range)) {
                            result.push(e)
                        }
                    }
                })
                return result
            }

            function draw_orc(a1, defeat) {
                const c = h.coord[numbered(a1)]
                const body_color
                    = defeat ? attr.orc.body.defeat: attr.orc.body.alive

                // body
                paper.rect(c.x-10, c.y-7, 20, 15, 2).attr(body_color)
                paper.path('M' + (c.x-1.7) + ',' + (c.y-7) + ' ' +
                'l2,-3 l2,3z').attr(body_color)

                // eye
                if (!defeat) {
                    paper.circle(c.x+5.5, c.y-3, 1).attr(attr.orc.eye)
                    paper.circle(c.x-5.5, c.y-3, 1).attr(attr.orc.eye)
                } else {
                    paper.path('M' + (c.x-7) + ',' + (c.y-5) + ' ' +
                    'l3,4').attr(attr.orc.eye)
                    paper.path('M' + (c.x-4) + ',' + (c.y-5) + ' ' +
                    'l-3,4').attr(attr.orc.eye)

                    paper.path('M' + (c.x+7.5) + ',' + (c.y-5) + ' ' +
                    'l-3.5,4').attr(attr.orc.eye)

                    paper.path('M' + (c.x+4) + ',' + (c.y-5) + ' ' +
                    'l3.5,4').attr(attr.orc.eye)
                }
            }

            function draw_fortress(a1) {
                const c = h.coord[numbered(a1)]
                let path = ''
                const x0 = c.x
                const y0 = c.y
                const r = 13

                for (let i = 0; i <= 6; i += 1) {
                    const a = i * 60;
                    const x = r * Math.cos(a * Math.PI / 180);
                    const y = r * Math.sin(a * Math.PI / 180);
                    const X = Math.round((x+x0)*100)/100;
                    const Y = Math.round((y+y0)*100)/100;
                    path += (i == 0 ? 'M': 'L') + (X) + ',' + (Y);
                    paper.rect(X-1.5, Y-1.5, 3, 3).attr({'fill': 'black',})
                }

                path += 'z ';

                const hex = paper.path(path).attr({'stroke-width': '1px',});

                return hex;
            }

            function numbered(a1) {
                return (AU.indexOf(a1[0])+1)*100 + parseInt(a1[1])
            }

            /*--------------------------------------------*
             *
             * start drawing
             *
             *--------------------------------------------*/
            const attr = {
                hex: {
                    base: {
                        'stroke-width': 0.2,
                        'stroke': 'black',
                        'fill': '#dfe8f7',
                    },
                    arc: {
                        'stroke-width': 0.2,
                        'stroke': 'black',
                        'fill': '#faba00',
                    },
                    fortress: {
                        'stroke-width': 0.2,
                        'stroke': 'black',
                    },
                },
                text: {
                    number: {
                        'stroke-width': 0,
                        'fill': 'black',
                        'font-size': '9px',
                    },
                },
                orc: {
                    body: {
                        defeat: {
                            'fill': '#F0801A',
                            'stroke': '#F0801A',
                            'stroke-width': '1px',
                        },
                        alive: {
                            'fill': '#163E69',
                            'stroke': '#163E69',
                            'stroke-width': 0,
                        },
                    },
                    eye: {
                        'stroke-width': '0.7px',
                        'stroke': 'white',
                        'fill': 'white',
                    },
                },
            }

            const row = 9
            const col = 12
            const r = 17
            const width = col*(r*1.5) + (r*1.5/2)
            const height = row*r*Math.sqrt(3) + (r*Math.sqrt(3)/2)
            const os = 10 // offset

            const paper = Raphael(dom, width, height, 0, 0)

            const h = new Hex_grid({
                paper: paper, r: r,
                number: [true, 0, 0, attr.text.number],
                row: row,
                col: col,
            })

            // draw grid
            h.draw_grid().attr(attr.hex.base)

            fortress = input[0]
            cannons = input[1]
            enemies = input[2]

            // draw fortress
            draw_fortress(fortress)

            // check output
            const check_result = Array.isArray(output) &&
                    output.length === input[1].length &&
                    output.reduce((a, b)=>a && DIRS.includes(b), true)

            // draw enemies
            input[2].forEach(e=>{
                draw_orc(e, false)
            })

            if (check_result) {
                // paint arc
                let arc_hexes = []
                cannons.forEach((c, i)=>{
                    const [arc, mn, mx] = c
                    const d = DIRS.indexOf(output[i])
                    const ac = get_arc_hexes(
                        fortress, d, arc, mn, mx,  row, col)
                    const ac_nums = ac.map(a=>(numbered(a)))
                    ac_nums.forEach(ac=>{
                        h.get_hex(ac).attr(attr.hex.arc)
                    })
                    arc_hexes = arc_hexes.concat(
                        ac_nums.map(a=>(AU[Math.floor(a/100)-1] + a%100)))
                    // arrows
                    const ft = h.coord[numbered(fortress)]
                    const d2 = [ 'NE', 'N', 'NW', 'SW', 'S', 'SE'].indexOf(
                        output[i])
                    const a = d2 * 60 + 30
                    const x = (r+2) * Math.cos(a * Math.PI / 180);
                    const y = (r+2) * Math.sin(a * Math.PI / 180) * -1
                    const X = Math.round((x+ft.x)*100)/100;
                    const Y = Math.round((y+ft.y)*100)/100;
                    Tri.draw_eq_tri({paper: paper, cx: X, cy: Y,
                        edge: 4, rotate: 180*((d)%2)}).attr({fill:'black'});
                })

                // draw defeat enemies
                input[2].forEach(e=>{
                    if (arc_hexes.includes(e)) {
                        draw_orc(e, true)
                    }
                })
            }
        }

        var $tryit;
        var io = new extIO({
            multipleArguments: true,
            functions: {
                js: 'fortressCannons',
                python: 'fortress_cannons'
            },
            animation: function($expl, data){
                fastTrainCanvas(
                    $expl[0],
                    data.in,
                    data.out,
                    data,
                );
            }
        });
        io.start();
    }
);
