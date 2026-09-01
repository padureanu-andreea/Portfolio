package ro.ase.cts.clase;

public class Internare implements Command{
    private PersonalSpital medic;
    private Pacient pacient;

    public Internare(PersonalSpital medic, Pacient pacient) {
        this.medic = medic;
        this.pacient = pacient;
    }

    @Override
    public void executa() {
        this.medic.preluarePacient(this.pacient);
    }
}
