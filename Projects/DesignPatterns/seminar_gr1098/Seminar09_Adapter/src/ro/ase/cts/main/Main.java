package ro.ase.cts.main;

import ro.ase.cts.clase.adapter.Adapter;
import ro.ase.cts.clase.spital.Medicament;

public class Main {
    public static void procurareMedicament(ro.ase.cts.clase.farmacie.Medicament medFarmacie){
        medFarmacie.cumparaMedicament();
    }

    public static void main(String[] args) {
        Medicament medS = new Medicament("Aerius", 20.3f);
        ro.ase.cts.clase.farmacie.Medicament medF = new ro.ase.cts.clase.farmacie.Medicament("Paracetamol");

        medS.achizitioneazaMedicament();
        medF.cumparaMedicament();

        procurareMedicament(medF);


        Adapter adaptorMedicament = new Adapter(medS);
        procurareMedicament(adaptorMedicament);
    }
}
