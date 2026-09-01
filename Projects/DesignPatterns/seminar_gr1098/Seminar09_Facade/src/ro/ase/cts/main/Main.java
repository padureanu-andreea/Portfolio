package ro.ase.cts.main;

import ro.ase.cts.clase.Medic;
import ro.ase.cts.clase.Pacient;
import ro.ase.cts.clase.ReceptieSpital;
import ro.ase.cts.clase.Salon;

public class Main {
    public static void main(String[] args) {
        Pacient pacient = new Pacient("Alin", 7);
        Medic medic = new Medic();
        Salon salon = new Salon();

        if(medic.areTrimitere(pacient)){
            int patLiber = salon.getPatLiber();
            if(patLiber != -1){
                System.out.println("Pacientul " + pacient.getPacient() + " va fi internat in patul " + patLiber);
                salon.ocupaPat(patLiber);
            }
        }

        Pacient pacient1 = new Pacient("Mara", 8);
        Pacient pacient2 = new Pacient("Mihai", 2);
        Pacient pacient3 = new Pacient("Irina", 6);
        Pacient pacient4 = new Pacient("Livia", 1);

        ReceptieSpital receptieSpital = new ReceptieSpital(medic, salon);
        receptieSpital.interneazaPacient(pacient1);
        receptieSpital.interneazaPacient(pacient2);
        receptieSpital.interneazaPacient(pacient3);
        receptieSpital.interneazaPacient(pacient4);
    }
}
