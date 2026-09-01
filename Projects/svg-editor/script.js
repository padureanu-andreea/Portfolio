'use strict';

class EditorGrafic {
    #container;
    #svg;
    #namespace = "http://www.w3.org/2000/svg";

    #instrumentCurent = 'selectie';
    #elementDesenat = null;   
    #elementSelectat = null;  
    #mouseApasat = false;
    #punctStart = { x: 0, y: 0 };
    
    #istoric = []; 

    constructor(idContainer) {
        this.#container = document.getElementById(idContainer);
        
        this.#creazaSVG();
        
        this.#incarcaDinMemorie(); 
        
        this.#ataseazaEvenimenteMouse();
        this.#ataseazaEvenimenteProprietati();
    }

    // Initializare SVG

    #creazaSVG() {
        this.#svg = document.createElementNS(this.#namespace, "svg");
        this.#svg.setAttribute("width", "800");
        this.#svg.setAttribute("height", "600");
        this.#svg.style.border = "1px solid #ccc"; 
        this.#container.appendChild(this.#svg);
    }

    // Incarcare automata 
    #ataseazaEvenimenteMouse() {
        this.#svg.addEventListener('mousedown', (e) => this.#startActiune(e));
        this.#svg.addEventListener('mousemove', (e) => this.#miscaMouse(e));
        this.#svg.addEventListener('mouseup', () => this.#finalActiune());
        this.#svg.addEventListener('dblclick', () => this.#terminaPolilinie());
    }

    // Modificare elemente existente
    #ataseazaEvenimenteProprietati() {
        const inputStroke = document.getElementById('input-culoare-stroke');
        const inputFill = document.getElementById('input-culoare-fill');
        const inputWidth = document.getElementById('input-grosime');

        // Modificarea culorii conturului
        inputStroke.addEventListener('input', (e) => {
            if (this.#elementSelectat) {
                this.#salveazaStare(); 
                this.#elementSelectat.setAttribute('stroke', e.target.value);
                this.#salveazaAutomat(); 
            }
        });

        // Modificarea culorii fundalului
        inputFill.addEventListener('input', (e) => {
            if (this.#elementSelectat) {
                this.#salveazaStare();
                this.#elementSelectat.setAttribute('fill', e.target.value);
                this.#salveazaAutomat();
            }
        });

        // Modificarea grosimii liniei
        inputWidth.addEventListener('input', (e) => {
            if (this.#elementSelectat) {
                this.#salveazaStare();
                this.#elementSelectat.setAttribute('stroke-width', e.target.value);
                this.#salveazaAutomat();
            }
        });
    }

    // Salveaza stare pentru Undo
    #salveazaStare() {
        if (this.#istoric.length > 20) this.#istoric.shift();
        this.#istoric.push(this.#svg.innerHTML);
    }

    // Salvare automata a starii curete in memoria browser-ului la fiecare modificare
    #salveazaAutomat() {
        localStorage.setItem('proiect_svg_data', this.#svg.innerHTML);
    }

    // Verificare daca exista ceva salvat cand pornesc pagina
    #incarcaDinMemorie() {
        const dateSalvate = localStorage.getItem('proiect_svg_data');
        if (dateSalvate) {
            this.#svg.innerHTML = dateSalvate;
        }
    }

    executaUndo() {
        if (this.#istoric.length > 0) {
            const stareVeche = this.#istoric.pop();
            this.#svg.innerHTML = stareVeche;
            this.#elementSelectat = null;
            this.#ascundePuncteControl();
            this.#salveazaAutomat(); 
        }
    }

    // Logica Coordonate Mouse

    // Calculez pozitia mouse-ului relativ la coltul stanga-sus al SVG-ului, nu al ecranului
    #obtineCoord(e) {
        const rect = this.#svg.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    // Logica principala (desenare/selectare)

    // Mouse Down
    #startActiune(e) {
        if (e.target.classList.contains('nod-control')) return;

        this.#mouseApasat = true;
        this.#punctStart = this.#obtineCoord(e);

        // selectare
        if (this.#instrumentCurent === 'selectie') {
            if (e.target !== this.#svg) {
                this.#selecteazaElement(e.target);
            } else {
                this.#deselecteaza();
            }
        } 
        else if (this.#instrumentCurent === 'polilinie') {
            // polilinie
            if (!this.#elementDesenat) {
                this.#salveazaStare();
                this.#elementDesenat = document.createElementNS(this.#namespace, 'polyline');
                this.#elementDesenat.setAttribute('points', `${this.#punctStart.x},${this.#punctStart.y}`);
                this.#aplicaStilCurent(this.#elementDesenat); 
                this.#elementDesenat.setAttribute('fill', 'none'); 
                this.#svg.appendChild(this.#elementDesenat);
            } else {
                const pct = this.#elementDesenat.getAttribute('points');
                this.#elementDesenat.setAttribute('points', `${pct} ${this.#punctStart.x},${this.#punctStart.y}`);
            }
            this.#mouseApasat = false; 
        }
        else {
            // forme geometrice
            this.#salveazaStare();
            this.#deselecteaza();
            
            if (this.#instrumentCurent === 'linie') {
                this.#elementDesenat = document.createElementNS(this.#namespace, 'line');
                this.#elementDesenat.setAttribute('x1', this.#punctStart.x);
                this.#elementDesenat.setAttribute('y1', this.#punctStart.y);
                this.#elementDesenat.setAttribute('x2', this.#punctStart.x);
                this.#elementDesenat.setAttribute('y2', this.#punctStart.y);
                this.#elementDesenat.setAttribute('fill', 'none');
            }
            else if (this.#instrumentCurent === 'rect') {
                this.#elementDesenat = document.createElementNS(this.#namespace, 'rect');
                this.#elementDesenat.setAttribute('x', this.#punctStart.x);
                this.#elementDesenat.setAttribute('y', this.#punctStart.y);
                this.#elementDesenat.setAttribute('width', 0);
                this.#elementDesenat.setAttribute('height', 0);
            }
            else if (this.#instrumentCurent === 'elipsa') {
                this.#elementDesenat = document.createElementNS(this.#namespace, 'ellipse');
                this.#elementDesenat.setAttribute('cx', this.#punctStart.x);
                this.#elementDesenat.setAttribute('cy', this.#punctStart.y);
                this.#elementDesenat.setAttribute('rx', 0);
                this.#elementDesenat.setAttribute('ry', 0);
            }

            this.#aplicaStilCurent(this.#elementDesenat);
            this.#svg.appendChild(this.#elementDesenat);
        }
    }

    // Mouse Move
    #miscaMouse(e) {
        const coord = this.#obtineCoord(e);

        if (this.#mouseApasat && this.#elementDesenat && this.#instrumentCurent !== 'selectie') {
            // Redimensionare la desenare
            if (this.#instrumentCurent === 'linie') {
                this.#elementDesenat.setAttribute('x2', coord.x);
                this.#elementDesenat.setAttribute('y2', coord.y);
            }
            else if (this.#instrumentCurent === 'rect') {
                const w = coord.x - this.#punctStart.x;
                const h = coord.y - this.#punctStart.y;
                
                if (w < 0) {
                    this.#elementDesenat.setAttribute('x', coord.x);
                    this.#elementDesenat.setAttribute('width', Math.abs(w));
                } else {
                    this.#elementDesenat.setAttribute('width', w);
                }

                if (h < 0) {
                    this.#elementDesenat.setAttribute('y', coord.y);
                    this.#elementDesenat.setAttribute('height', Math.abs(h));
                } else {
                    this.#elementDesenat.setAttribute('height', h);
                }
            }
            else if (this.#instrumentCurent === 'elipsa') {
                this.#elementDesenat.setAttribute('rx', Math.abs(coord.x - this.#punctStart.x));
                this.#elementDesenat.setAttribute('ry', Math.abs(coord.y - this.#punctStart.y));
            }
        }
        else if (this.#mouseApasat && this.#elementSelectat && this.#instrumentCurent === 'selectie') {
            // Mutare elemente (Drag & Drop)
            const dx = coord.x - this.#punctStart.x; // Deplasare pe X
            const dy = coord.y - this.#punctStart.y; // Deplasare pe Y
            
            this.#mutaElement(this.#elementSelectat, dx, dy);
            this.#punctStart = coord;
        }
    }

    // Mouse Up
    #finalActiune() {
        if (this.#instrumentCurent !== 'polilinie') {
            this.#mouseApasat = false;
            this.#elementDesenat = null;
            this.#salveazaAutomat(); // Salvam dupa ce terminam desenul/mutarea
        }
    }

    // Polilinia se termina doar la dublu click
    #terminaPolilinie() {
        if (this.#instrumentCurent === 'polilinie') {
            this.#elementDesenat = null;
            this.#salveazaAutomat();
        }
    }

    // Aplica stilul curent din inputuri la un element nou
    #aplicaStilCurent(el) {
        const s = document.getElementById('input-culoare-stroke').value;
        const f = document.getElementById('input-culoare-fill').value;
        const w = document.getElementById('input-grosime').value;

        el.setAttribute('stroke', s);
        el.setAttribute('stroke-width', w);

        if (this.#instrumentCurent === 'rect' || this.#instrumentCurent === 'elipsa') {
            el.setAttribute('fill', f);
        } else {
            el.setAttribute('fill', 'none'); 
        }
    }

    #selecteazaElement(el) {
        this.#deselecteaza();
        this.#elementSelectat = el;
        this.#elementSelectat.classList.add('element-selectat');
        
        const stroke = el.getAttribute('stroke');
        const fill = el.getAttribute('fill');
        const width = el.getAttribute('stroke-width');

        if(stroke) document.getElementById('input-culoare-stroke').value = stroke;

        if(fill && fill !== 'none') document.getElementById('input-culoare-fill').value = fill;
        
        if(width) document.getElementById('input-grosime').value = width;

        if (this.#elementSelectat.tagName === 'polyline') {
            this.#afiseazaPuncteControl(this.#elementSelectat);
        }
    }

    #deselecteaza() {
        if (this.#elementSelectat) {
            this.#elementSelectat.classList.remove('element-selectat');
            this.#elementSelectat = null;
            this.#ascundePuncteControl();
        }
    }

    #mutaElement(el, dx, dy) {
        const tag = el.tagName;
        if (tag === 'rect') {
            el.setAttribute('x', parseFloat(el.getAttribute('x')) + dx);
            el.setAttribute('y', parseFloat(el.getAttribute('y')) + dy);
        } else if (tag === 'ellipse') {
            el.setAttribute('cx', parseFloat(el.getAttribute('cx')) + dx);
            el.setAttribute('cy', parseFloat(el.getAttribute('cy')) + dy);
        } else if (tag === 'line') {
            el.setAttribute('x1', parseFloat(el.getAttribute('x1')) + dx);
            el.setAttribute('y1', parseFloat(el.getAttribute('y1')) + dy);
            el.setAttribute('x2', parseFloat(el.getAttribute('x2')) + dx);
            el.setAttribute('y2', parseFloat(el.getAttribute('y2')) + dy);
        } else if (tag === 'polyline') {
            const pct = el.getAttribute('points').split(' ');
            const pctNoi = pct.map(p => {
                if(!p) return '';
                const c = p.split(',');
                return `${parseFloat(c[0])+dx},${parseFloat(c[1])+dy}`;
            }).join(' ');
            el.setAttribute('points', pctNoi);
            
            this.#ascundePuncteControl();
            this.#afiseazaPuncteControl(el);
        }
    }

    // Editare puncte de control pentru polilinie

    #afiseazaPuncteControl(polilinie) {
        const puncte = polilinie.getAttribute('points').split(' ').filter(p => p !== "");
        
        puncte.forEach((p, index) => {
            const [x, y] = p.split(',');
            const nod = document.createElementNS(this.#namespace, 'circle');
            nod.setAttribute('cx', x);
            nod.setAttribute('cy', y);
            nod.setAttribute('r', 6); 
            nod.classList.add('nod-control');
            
            nod.addEventListener('mousedown', (e) => {
                e.stopPropagation(); 
                
                const miscaNod = (evMove) => {
                    const c = this.#obtineCoord(evMove);
                    nod.setAttribute('cx', c.x);
                    nod.setAttribute('cy', c.y);
                    
                    const arr = polilinie.getAttribute('points').split(' ').filter(v => v !== "");
                    arr[index] = `${c.x},${c.y}`;
                    polilinie.setAttribute('points', arr.join(' '));
                };
                
                const stopNod = () => {
                    window.removeEventListener('mousemove', miscaNod);
                    window.removeEventListener('mouseup', stopNod);
                    this.#salveazaStare();
                    this.#salveazaAutomat();
                };

                window.addEventListener('mousemove', miscaNod);
                window.addEventListener('mouseup', stopNod);
            });

            this.#svg.appendChild(nod);
        });
    }

    #ascundePuncteControl() {
        const noduri = this.#svg.querySelectorAll('.nod-control');
        noduri.forEach(n => n.remove());
    }

    // Export SVG
    exportaSVG() {
        this.#ascundePuncteControl();
        const date = new XMLSerializer().serializeToString(this.#svg);
        const blob = new Blob([date], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "proiect_desen.svg";
        link.click();
    }

    // Export raster (PNG)
    exportaPNG() {
        this.#ascundePuncteControl();
        this.#deselecteaza();

        const canvas = document.getElementById('canvas-ascuns');
        const ctx = canvas.getContext('2d');
        const dateSVG = new XMLSerializer().serializeToString(this.#svg);
        
        const img = new Image();
        const svgBlob = new Blob([dateSVG], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = function() {
            canvas.width = 800;
            canvas.height = 600;
            ctx.fillStyle = "white"; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            const pngUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = "proiect_export.png";
            link.click();
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }

    // API public
    setInstrument(nume) { this.#instrumentCurent = nume; }
    
    stergeElementSelectat() {
        if (this.#elementSelectat) {
            this.#salveazaStare();
            this.#elementSelectat.remove();
            this.#deselecteaza();
            this.#salveazaAutomat();
        }
    }

    // Metoda pentru a sterge tot desenul si memoria
    resetCanvas() {
        if (confirm("Esti sigur ca vrei sa stergi tot desenul? Aceasta actiune este ireversibila!")) {
            this.#svg.innerHTML = "";
            
            localStorage.removeItem('proiect_svg_data');
            
            this.#istoric = [];
            this.#elementSelectat = null;
            this.#elementDesenat = null;
            this.#ascundePuncteControl();
        }
    }
}

// Initializare la incarcarea paginii
document.addEventListener("DOMContentLoaded", () => {
    const app = new EditorGrafic("spatiu-lucru");

    const butoane = document.querySelectorAll('.panou-control .btn');
    function activeaza(id) {
        butoane.forEach(b => b.classList.remove('activ'));
        const btn = document.getElementById(id);
        if(btn) btn.classList.add('activ');
    }

    document.getElementById('btn-selectie').onclick = () => { app.setInstrument('selectie'); activeaza('btn-selectie'); };
    document.getElementById('btn-linie').onclick = () => { app.setInstrument('linie'); activeaza('btn-linie'); };
    document.getElementById('btn-rect').onclick = () => { app.setInstrument('rect'); activeaza('btn-rect'); };
    document.getElementById('btn-elipsa').onclick = () => { app.setInstrument('elipsa'); activeaza('btn-elipsa'); };
    document.getElementById('btn-polilinie').onclick = () => { app.setInstrument('polilinie'); activeaza('btn-polilinie'); };

    document.getElementById('btn-undo').onclick = () => app.executaUndo();
    document.getElementById('btn-sterge').onclick = () => app.stergeElementSelectat();
    document.getElementById('btn-reset').onclick = () => app.resetCanvas();
    document.getElementById('btn-salvare').onclick = () => app.exportaSVG();
    document.getElementById('btn-export').onclick = () => app.exportaPNG();
});