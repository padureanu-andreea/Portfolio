package ro.ase.cts.clase;

public class CiocolataCalda extends BauturaAbstracta implements IBauturaPrototype {
    public CiocolataCalda(String nume, int volum, double pret) {
        super(nume, volum, pret);
    }

    @Override
    public void preparare() {
        System.out.println("Ciocolata calda se prepara astfel:");
        System.out.println("1. Se incalzeste laptele.");
        System.out.println("2. Se adauga laptele fierbinte peste mixul de ciocolata calda.");
        System.out.println("3. Se amesteca si se adauga frisca.");
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
        System.out.println("Pretul unei ciocolate calde este:");
        return super.pret;
    }

    @Override
    public boolean adaugaTopping() {
        System.out.println("S-a adaugat topping la ciocolata calda!");
        return true;
    }

    public CiocolataCalda() {
    }

    @Override
    public IBauturaPrototype clone() {
        CiocolataCalda ciocolataCalda = new CiocolataCalda();
        ciocolataCalda.nume = this.nume;
        ciocolataCalda.volum = this.volum;
        ciocolataCalda.pret = this.pret;
        return ciocolataCalda;
    }
}
