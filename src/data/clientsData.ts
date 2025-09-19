import { Client, Company } from "@/types/calendar";

export const sampleClients: Client[] = [
  {
    id: "austa",
    name: "Grupo Austa",
    companies: [
      {
        id: "austa-hospital",
        name: "Austa Hospital",
        color: "#4CAF50", // Verde
        groupName: "Grupo Austa"
      },
      {
        id: "austa-clinicas",
        name: "Austa Clínicas", 
        color: "#2196F3", // Azul
        groupName: "Grupo Austa"
      },
      {
        id: "austa-laboratorio",
        name: "Austa Laboratório",
        color: "#FF9800", // Laranja
        groupName: "Grupo Austa"
      },
      {
        id: "austa-imagem",
        name: "Austa Imagem",
        color: "#9C27B0", // Roxo
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
        color: "#E91E63", // Pink
      },
      {
        id: "empresa-exemplo-2", 
        name: "Empresa B",
        color: "#00BCD4", // Cyan
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