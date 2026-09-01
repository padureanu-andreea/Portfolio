package ro.ase.cts.main;

import ro.ase.cts.clase.ISpital;
import ro.ase.cts.clase.Pacient;
import ro.ase.cts.clase.PacientAbonat;
import ro.ase.cts.clase.Spital;

public class Main {
    public static void main(String[] args) {
        Pacient pacient1 = new PacientAbonat("Ionescu Alin", 24);
        Pacient pacient2 = new PacientAbonat("Popescu Mara", 56);
        Pacient pacient3 = new PacientAbonat("Andreescu Calin", 32);

        ISpital spital = new Spital("Universitar");
        spital.aboneazaPacient(pacient1);
        spital.aboneazaPacient(pacient2);
        spital.aboneazaPacient(pacient3);

        ((Spital) spital).notificareEpidemie();
        System.out.println("---------------------------------------------");
        ((Spital) spital).notificareVirus();

        spital.dezaboneazaPacient(pacient1);
        System.out.println("---------------------------------------------");
        ((Spital) spital).notificareEpidemie();
    }
}
