namespace AgentieImobiliara
{
    partial class LoginControl1
    {
        /// <summary> 
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary> 
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Component Designer generated code

        /// <summary> 
        /// Required method for Designer support - do not modify 
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            lblUtilizator = new Label();
            txtUsername = new TextBox();
            lblParola = new Label();
            txtParola = new TextBox();
            btnLogin = new Button();
            lblMesajEroare = new Label();
            SuspendLayout();
            // 
            // lblUtilizator
            // 
            lblUtilizator.AutoSize = true;
            lblUtilizator.Font = new Font("Broadway", 12F, FontStyle.Regular, GraphicsUnit.Point, 0);
            lblUtilizator.Location = new Point(84, 117);
            lblUtilizator.Name = "lblUtilizator";
            lblUtilizator.Size = new Size(146, 27);
            lblUtilizator.TabIndex = 0;
            lblUtilizator.Text = "Username";
            // 
            // txtUsername
            // 
            txtUsername.Location = new Point(339, 113);
            txtUsername.Name = "txtUsername";
            txtUsername.Size = new Size(234, 31);
            txtUsername.TabIndex = 1;
            // 
            // lblParola
            // 
            lblParola.AutoSize = true;
            lblParola.Font = new Font("Broadway", 12F, FontStyle.Regular, GraphicsUnit.Point, 0);
            lblParola.Location = new Point(84, 195);
            lblParola.Name = "lblParola";
            lblParola.Size = new Size(100, 27);
            lblParola.TabIndex = 2;
            lblParola.Text = "Parola";
            // 
            // txtParola
            // 
            txtParola.Location = new Point(339, 194);
            txtParola.Name = "txtParola";
            txtParola.PasswordChar = '*';
            txtParola.Size = new Size(234, 31);
            txtParola.TabIndex = 3;
            // 
            // btnLogin
            // 
            btnLogin.BackColor = SystemColors.ActiveCaption;
            btnLogin.Location = new Point(220, 265);
            btnLogin.Name = "btnLogin";
            btnLogin.Size = new Size(162, 59);
            btnLogin.TabIndex = 4;
            btnLogin.Text = "Autentificare";
            btnLogin.UseVisualStyleBackColor = false;
            btnLogin.Click += btnLogin_Click;
            // 
            // lblMesajEroare
            // 
            lblMesajEroare.AutoSize = true;
            lblMesajEroare.Location = new Point(268, 44);
            lblMesajEroare.Name = "lblMesajEroare";
            lblMesajEroare.Size = new Size(0, 25);
            lblMesajEroare.TabIndex = 5;
            // 
            // LoginControl1
            // 
            AutoScaleDimensions = new SizeF(10F, 25F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = SystemColors.InactiveCaption;
            Controls.Add(lblMesajEroare);
            Controls.Add(btnLogin);
            Controls.Add(txtParola);
            Controls.Add(lblParola);
            Controls.Add(txtUsername);
            Controls.Add(lblUtilizator);
            Name = "LoginControl1";
            Size = new Size(633, 359);
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Label lblUtilizator;
        private TextBox txtUsername;
        private Label lblParola;
        private TextBox txtParola;
        private Button btnLogin;
        private Label lblMesajEroare;
    }
}
