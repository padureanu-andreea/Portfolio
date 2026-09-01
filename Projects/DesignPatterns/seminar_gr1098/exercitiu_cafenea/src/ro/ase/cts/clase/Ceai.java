package ro.ase.cts.clase;

public class Ceai extends BauturaAbstracta implements IBauturaPrototype {
    public Ceai(String nume, int volum, double pret) {
        super(nume, volum, pret);
    }

    @Override
    public void preparare() {
        System.out.println("Ceaiul se prepara astfel:");
        System.out.println("1. Se fierbe apa.");
        System.out.println("2. Se pune apa fiarta peste pliculetul de ceai.");
        System.out.println("3. Se adauga miere si o felie de lamaie.");
    }

    @Override
    public String getDetalii() {
        StringBuilder builder = new StringBuilder();
        builder.append(super.nume);
        builder.append(" are ").append(super.volum);
        builder.append(" mililitrii si costa ").append(super.pret);
        builder.append(" lei.");

        return builder.toString();
    }

    @Override
    public double getPret() {
        System.out.println("Pretul unui ceai este:");
        return super.pret;
    }

    @Override
    public boolean adaugaTopping() {
        System.out.println("S-a adaugat topping la ceai!");
        return true;
    }

    public Ceai() {
    }

    @Override
    public IBauturaPrototype clone() {
        Ceai ceai = new Ceai();
        ceai.nume = this.nume;
        ceai.volum = this.volum;
        ceai.pret = this.pret;
        return ceai;
    }
}
