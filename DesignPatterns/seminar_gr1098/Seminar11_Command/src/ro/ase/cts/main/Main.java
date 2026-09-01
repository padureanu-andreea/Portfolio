package ro.ase.cts.main;

import ro.ase.cts.clase.*;

import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        PersonalSpital medic = new Medic("Georgescu");
        PersonalSpital asistenta = new Asistenta("Popescu");

        Pacient pacient1 = new Pacient("Alin");
        Pacient pacient2 = new Pacient("Maria");

        Command comanda1 = new Internare(medic, pacient1);
        Command comanda2 = new Tratare(asistenta, pacient2);

        Operator operator = new Operator();

        operator.inregistreaza(comanda1);
        operator.inregistreaza(comanda2);

        operator.executaFisa();

        operator.inregistreaza(new Tratare(asistenta, new Pacient("Sara")));
        operator.executaFisa();
        operator.executaFisa();
    }
}
