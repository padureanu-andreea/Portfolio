package ro.ase.cts.main;

import ro.ase.cts.clase.Autobuz;
import ro.ase.cts.clase.ManagerLinie;

public class Main {
    public static void main(String[] args) {
        Autobuz autobuz101 = new Autobuz("Audi", 2022, 50);
        Autobuz autobuz102 = new Autobuz("Mercedes", 2023, 30);
        Autobuz autobuz103 = new Autobuz("Ford", 2019, 20);

        ManagerLinie managerLinie = new ManagerLinie();
        managerLinie.getLinie(103, "Romana", "Universitate").afiseazaNrMaximPasageriPeLinie(autobuz103);
        managerLinie.getLinie(103, "Mama", "Tata").descriereLinie(autobuz103);
        managerLinie.getLinie(102, "Mama", "Tata").descriereLinie(autobuz102);
        managerLinie.getLinie(102, "Mama", "Tata").descriereLinie(autobuz101);
    }
}
