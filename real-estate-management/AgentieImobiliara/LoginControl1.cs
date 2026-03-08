using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace AgentieImobiliara
{
    public class LoginEventArgs : EventArgs
    {
        public string Rol { get; private set; }
        public LoginEventArgs(string rol)
        {
            Rol = rol;
        }
    }
    public partial class LoginControl1 : UserControl
    {
        public delegate void LoginSuccessEventHandler(object sender, LoginEventArgs e);
        public event LoginSuccessEventHandler LoginSuccess;

        private readonly Dictionary<string, (string Parola, string Rol)> utilizatori = new Dictionary<string, (string, string)>
        {
            { "admin", ("admin123", "Admin") },
            { "client", ("client123", "Client") }
        };

        public LoginControl1()
        {
            InitializeComponent();
        }

        private void btnLogin_Click(object sender, EventArgs e)
        {
            string username = txtUsername.Text;
            string password = txtParola.Text;

            if (utilizatori.ContainsKey(username) && utilizatori[username].Parola == password)
            {
                lblMesajEroare.Text = ""; 
                string rol = utilizatori[username].Rol;

                LoginSuccess?.Invoke(this, new LoginEventArgs(rol));
            }
            else
            {
                lblMesajEroare.Text = "Utilizator sau parola incorecta!";
                txtParola.Clear();
                txtUsername.Focus();
            }
        }

        public void GolesteCampuri()
        {
            txtUsername.Clear();
            txtParola.Clear();
            lblMesajEroare.Text = "";
            txtUsername.Focus(); 
        }
    }
    
}
