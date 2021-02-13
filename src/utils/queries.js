import { gql } from "@apollo/client";

export const QUERIES = {
    GET_GROUP_BUDGETS: gql`
        query budget($groupId: String) {
            budget(groupId: $groupId) {
                id
                title
                created
                groupId
                comment
                people {
                    paying
                    free
                }
                period {
                    start
                    end
                }
            }
        }
    `,
    GET_BUDGET: gql`
        query budget($id: String) {
            budget(id: $id) {
                id
                title
                created
                groupId
                comment
                people {
                    paying
                    free
                }
                period {
                    start
                    end
                }
            }
        }
    `,
    GET_BUDGET_TOTAL: gql`
        query budgetTotal($budgetId: ID, $people: PeopleInput, $days: Int) {
            budgetTotal(
                budgetId: $budgetId, 
                people: $people,
                days: $days
            )
        }
    `,
    GET_COSTS: gql`
        query cost($budgetId: String) {
            cost(budgetId: $budgetId) {
                id
            }
        }
    `,
    GET_GROUP: gql`
        query group($id: String) {
            group(id: $id) {
                id
                name
            }
        }
    `
}

export const SUBS = {
    BUDGET_ADDED: gql`
        subscription budgetAdded($groupId: ID) {
            budgetAdded(groupId: $groupId) {
                title
            }
        }
    `
}

export const MUTATIONS = {
    DELETE_BUDGET: gql`
        mutation deleteBudget($id: String) {
            deleteBudget(id: $id){title}
        }
    `
}