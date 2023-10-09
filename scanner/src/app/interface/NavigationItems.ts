export interface TopLevelNavItem{
  icon: string,
  displayName: string,
  children: Array<SubLevelNavItem>,
  companyOnly?: boolean,
}

export interface SubLevelNavItem{
  icon: string,
  path: string,
  displayName: string,
  permissionName?: string,
  initialAdminOnly?:boolean,
  requireLogin?:boolean,
  shouldHide?:boolean,
  shouldBold?:boolean,
}
