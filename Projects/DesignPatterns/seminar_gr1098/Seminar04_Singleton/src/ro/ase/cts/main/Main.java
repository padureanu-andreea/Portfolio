package ro.ase.cts.main;

import ro.ase.cts.singleton.Hotel;

public class Main {
    public static void main(String[] args){
        Hotel hotel1 = Hotel.getInstance("Intercontinental", 10, 8);
        Hotel hotel2 = hotel1.getInstance("MegaHotel", 200, 100); //mu pot sa creez o a doua instanta, imi returneaza tot hotel 1

        hotel1.rezervaCamera();
        hotel1.rezervaCamera();

        hotel2.rezervaCamera();
        hotel2.rezervaCamera();

        hotel1.afiseazaDetaliiHotel();
        hotel2.afiseazaDetaliiHotel();

    }
}
