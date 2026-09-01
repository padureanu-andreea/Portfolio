package ro.ase.cts.main;

import ro.ase.cts.clase.Autobuz;
import ro.ase.cts.clase.Command;
import ro.ase.cts.clase.Operator;
import ro.ase.cts.clase.Plecare;

public class Main {
    public static void main(String[] args) {
        Operator operator = new Operator();
        Command comanda1 = new Plecare(new Autobuz("Mercedes"), 34);
        Command comanda2 = new Plecare(new Autobuz("Audi"), 156);

        operator.adaugaComanda(comanda1);
        operator.adaugaComanda(comanda2);
        operator.adaugaComanda(new Plecare(new Autobuz("Dacia"), 4));

        operator.executaComanda();
        operator.executaComanda();
        operator.executaComanda();
    }
}
