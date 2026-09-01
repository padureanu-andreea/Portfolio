package ro.ase.cts.prototype.main;

import ro.ase.cts.prototype.clase.Rezervare;
import ro.ase.cts.prototype.clase.RezervareAbstracta;

public class Main {
    public static void main(String[] args) {
//        Rezervare rezervare1 = new Rezervare("Gigica", 14, 24, "0723425621");
//        Rezervare rezervare2 = (Rezervare) rezervare1.clone(); //prin metoda asta cu cast se incalca dependency inversion
//
//        rezervare2.setOraRezervare(10);
//        rezervare2.setZiuaRezervarii(17);

        RezervareAbstracta rezervare1 = new Rezervare("Gigica", 14, 24, "0723425621");
        RezervareAbstracta rezervare2 = rezervare1.clone();

        ((Rezervare)rezervare2).setOraRezervare(10);
        ((Rezervare)rezervare2).setZiuaRezervarii(17); //aici se respecta dependency inversion pt ca am dat cast aici

        System.out.println(rezervare1.toString());
        System.out.println(rezervare2.toString());
    }
}
