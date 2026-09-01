package ro.ase.cts.clase;

public class Student {
    private ModSustinereExamen modSustinereExamen;
    private String nume;

    public Student(ModSustinereExamen modSustinereExamen) {
        this.modSustinereExamen = modSustinereExamen;
    }

    public Student(String nume) {
        this.nume = nume;
        this.modSustinereExamen = new Grila();
    }

    public void setModSustinereExamen(ModSustinereExamen modSustinereExamen) {
        this.modSustinereExamen = modSustinereExamen;
    }

    public void examinare(){
        this.modSustinereExamen.sustinereExamen();
    }
}
