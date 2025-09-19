import { Client, Company } from "@/types/calendar";

export const sampleClients: Client[] = [
  {
    id: "austa",
    name: "Grupo Austa",
    companies: [
      {
        id: "austa-clinica",
        name: "Austa Clínica",
        color: "#4CAF50", // Verde
        groupName: "Grupo Austa"
      },
      {
        id: "austa-hospital",
        name: "Austa Hospital",
        color: "#2196F3", // Azul
        groupName: "Grupo Austa"
      },
      {
        id: "imc",
        name: "IMC",
        color: "#FF9800", // Laranja
        groupName: "Grupo Austa"
      },
      {
        id: "todas-unidades",
        name: "Todas unidades",
        color: "#9C27B0", // Roxo
        groupName: "Grupo Austa"
      },
      {
        id: "austa-clinica-imc",
        name: "Austa Clínica e IMC",
        color: "#E91E63", // Pink
        groupName: "Grupo Austa"
      },
      {
        id: "austa-clinica-hospital",
        name: "Austa Clínica e Hospital",
        color: "#00BCD4", // Cyan
        groupName: "Grupo Austa"
      },
      {
        id: "imc-austa-hospital",
        name: "IMC e Austa Hospital",
        color: "#795548", // Brown
        groupName: "Grupo Austa"
      }
    ]
  },
  {
    id: "cliente-exemplo",
    name: "Cliente Exemplo",
    companies: [
      {
        id: "empresa-exemplo-1",
        name: "Empresa A",
        color: "#607D8B", // Blue Grey
      },
      {
        id: "empresa-exemplo-2", 
        name: "Empresa B",
        color: "#8BC34A", // Light Green
      }
    ]
  }
];

export const getClientById = (id: string): Client | undefined => {
  return sampleClients.find(client => client.id === id);
};

export const getCompanyById = (clientId: string, companyId: string): Company | undefined => {
  const client = getClientById(clientId);
  return client?.companies.find(company => company.id === companyId);
};

export const getAllCompanies = (): Company[] => {
  return sampleClients.flatMap(client => client.companies);
};